import OpenAI from "openai";
import { createHash } from "crypto";
import type { ResumeAnalysis } from "@/types";

const SYSTEM_PROMPT = `You are an enterprise-grade ATS scoring engine. You output ONLY valid JSON. No text, no explanation, no markdown — just a single JSON object.

SCORING PROTOCOL:
Start at base score 50. Evaluate the resume against these criteria:

ADDITIONS (only award with clear evidence):
- Quantified achievements: ≥3 metrics with real numbers (%, $, users, latency) = +20. Two metrics = +12. One = +5. Zero = +0.
- Tech stack depth: Technologies listed AND demonstrated in projects/jobs = +15. Listed but not demonstrated = +4. Absent = +0.
- Real projects: Projects with measurable outcomes AND links = +10. Outcomes only = +6. Links only = +3. Neither = +0.
- Language quality: No filler phrases ("responsible for", "helped with", "worked on", "involved in") = +8. Some filler = +2. Mostly filler = +0.
- Structure: All sections present (Contact, Experience, Skills, Education, Projects), consistent formatting = +5. Partial = +2. Poor = +0.
- Credibility: GitHub/portfolio links, verifiable companies, publications = +7. Partial = +3. None = +0.

DEDUCTIONS (automatic):
- Zero quantified achievements = -25
- ≥3 filler phrases detected = -15
- Tech stack missing or irrelevant to role = -15
- Missing critical keywords for role = -12
- Poor structure = -10
- Unexplained employment gap >6 months = -8 each (max -16)
- Keywords stuffed in skills only, not used in context = -5
- No verifiable links = -5

HARD CAPS (applied after calculation, cannot be overridden):
- No quantified achievements at all → score capped at 52
- Only 1-2 achievements → capped at 62
- Filler language dominant → capped at 58
- No relevant tech stack → capped at 55
- Missing most role keywords → capped at 60
- Fresher with no projects and no internships → capped at 45
- Score ≥80 requires: ≥3 achievements + relevant tech + no filler. Otherwise clamp to 79.
- Score ≥90 requires: all above + verifiable links + senior-level impact. Otherwise clamp to 89.

BEHAVIOR:
- Judge ONLY what is written. Never assume skills not listed.
- "Developed a feature" = filler. "Built payment gateway handling 10K transactions/day" = evidence.
- A skills list alone does not prove depth. Look for usage in job descriptions and projects.
- Be brutally honest in weaknesses and advice. Do not soften language.

OUTPUT FORMAT (strict JSON, no other text):
{
  "role": "specific inferred role",
  "level": "Fresher | Junior | Mid-level | Senior",
  "score": <integer 0-100 after all caps applied>,
  "scoreBreakdown": {
    "baseScore": 50,
    "earned": <total points added>,
    "deducted": <total points removed>,
    "capsApplied": ["list each cap that was triggered, or empty array"]
  },
  "techStack": ["only technologies evidenced in resume"],
  "strengths": ["max 3 strengths with cited evidence from the resume"],
  "weaknesses": ["max 4 weaknesses, be specific and blunt"],
  "missingKeywords": ["keywords expected for this role but absent"],
  "suggestions": ["max 4 actionable improvements specific to THIS resume"],
  "advice": "2-3 sentences of brutally honest career advice."
}
`;

// Simple in-memory cache to store analysis results by text hash
const analysisCache = new Map<string, ResumeAnalysis>();

function getHash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

let openaiInstance: OpenAI | null = null;

function getClient(): OpenAI {
  if (openaiInstance) return openaiInstance;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured");
  }

  openaiInstance = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
    timeout: 180000,
    maxRetries: 3,
  });

  return openaiInstance;
}

export async function analyzeResume(
  resumeText: string,
): Promise<ResumeAnalysis> {
  const hash = getHash(resumeText);
  
  // Check cache first
  if (analysisCache.has(hash)) {
    console.log("Returning cached analysis result");
    return analysisCache.get(hash)!;
  }

  const client = getClient();
  let responseText = "";

  try {
    // Trim resume to stay within 8K TPM limit
    // Budget: ~1500 (system) + resume + 4096 (max_tokens) < 8000
    // So resume must be < ~2400 tokens (~1800 chars)
    const trimmedResume = resumeText.length > 1800
      ? resumeText.substring(0, 1800) + "\n[Resume trimmed for processing]"
      : resumeText;

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Analyze this resume and return ONLY JSON:\n\n${trimmedResume}`,
        },
      ],
      temperature: 0.1,
      top_p: 0.9,
      max_tokens: 4096,
    });

    responseText = completion.choices[0]?.message?.content || "";
    const finishReason = completion.choices[0]?.finish_reason;

    if (!responseText) {
      throw new Error("No response received from AI model");
    }

    // Step 1: Strip <think>...</think> blocks (reasoning models emit these)
    let cleaned = responseText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // Step 2: Remove markdown code fences
    cleaned = cleaned
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    // Step 3: Find the correct outermost JSON object using bracket matching
    let jsonString = "";
    let braceDepth = 0;
    let jsonStartIdx = -1;

    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === "{") {
        if (braceDepth === 0) jsonStartIdx = i;
        braceDepth++;
      } else if (cleaned[i] === "}") {
        braceDepth--;
        if (braceDepth === 0 && jsonStartIdx !== -1) {
          const candidate = cleaned.substring(jsonStartIdx, i + 1);
          if (candidate.length > jsonString.length) {
            jsonString = candidate;
          }
          jsonStartIdx = -1;
        }
      }
    }

    // If no complete JSON found, try to repair truncated JSON
    if (!jsonString && jsonStartIdx !== -1 && braceDepth > 0) {
      // The JSON was started but never closed (model ran out of tokens)
      let truncated = cleaned.substring(jsonStartIdx);
      // Close any open braces/brackets
      while (braceDepth > 0) {
        truncated += "}";
        braceDepth--;
      }
      jsonString = truncated;
    }

    if (!jsonString) {
      console.error("No JSON found. Response:", cleaned.substring(0, 500));
      throw new Error("No valid JSON found in AI response");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawAnalysis = JSON.parse(jsonString) as any;

    // Map the AI output to the ResumeAnalysis type
    const analysis: ResumeAnalysis = {
      role: rawAnalysis.role || "Unknown Role",
      level: rawAnalysis.level || "Unknown",
      score: rawAnalysis.scoreBreakdown?.finalScore ?? rawAnalysis.score ?? 50,
      techStack: Array.isArray(rawAnalysis.techStack) ? rawAnalysis.techStack : [],
      strengths: Array.isArray(rawAnalysis.strengths) ? rawAnalysis.strengths : [],
      weaknesses: Array.isArray(rawAnalysis.weaknesses) ? rawAnalysis.weaknesses : [],
      missingKeywords: Array.isArray(rawAnalysis.missingKeywords)
        ? rawAnalysis.missingKeywords
        : Array.isArray(rawAnalysis.keywordAnalysis?.missingKeywords)
          ? rawAnalysis.keywordAnalysis.missingKeywords
          : [],
      suggestions: Array.isArray(rawAnalysis.suggestions) ? rawAnalysis.suggestions : [],
      advice: rawAnalysis.advice || "No advice provided.",
    };

    analysis.score = Math.min(100, Math.max(0, analysis.score));

    // Save to cache
    analysisCache.set(hash, analysis);

    return analysis;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("JSON parse failed. Raw response:", responseText.substring(0, 800));
      throw new Error("Failed to parse AI response as JSON. The response may have been truncated.");
    }
    throw error;
  }
}
