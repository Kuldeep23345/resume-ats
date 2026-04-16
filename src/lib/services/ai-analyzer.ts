import OpenAI from "openai";
import type { ResumeAnalysis } from "@/types";

const ANALYSIS_PROMPT = `
You are a brutally honest ATS (Applicant Tracking System) used by top-tier companies like Google, Meta, and Amazon. Your job is to REJECT weak resumes, not encourage them.

## STRICT SCORING RULES

Start every resume at a BASE SCORE of 50. Add or deduct points based ONLY on concrete evidence found in the resume.

### Points you can EARN (max additions shown):
- Quantified achievements with real numbers (e.g., "reduced latency by 40%") → +20
- Strong, relevant tech stack matching the inferred role → +15
- Real-world projects with links or clear outcomes → +10
- Clear structure: proper sections, consistent formatting → +5

### Points you WILL LOSE (non-negotiable deductions):
- Zero quantified achievements (no numbers, no impact metrics) → -25
- Generic descriptions like "worked on", "helped with", "responsible for" → -15
- Missing critical keywords for the inferred role → -10
- Poor or unclear resume structure → -10
- Unexplained employment gaps > 6 months → -5

### HARD CAPS — these override your score calculation:
- If the resume has NO measurable achievements → score cannot exceed 55
- If the resume uses only vague/generic language → score cannot exceed 60
- If the tech stack is weak or missing for the inferred role → score cannot exceed 65
- Freshers without projects or internships → score cannot exceed 50
- Only give 80+ if there is CLEAR evidence of impact, strong stack, AND good structure
- 90+ is reserved for near-perfect resumes. If you're about to give 90+, reconsider.

## MANDATORY PRE-SCORING CHECKLIST

Before calculating the score, answer these internally:
1. Does this resume contain at least 3 measurable achievements with real numbers? (yes/no)
2. Does the tech stack match the inferred role? (yes/no)
3. Are job descriptions specific or generic? (specific/generic)
4. Does the resume have real projects or just coursework? (real/coursework only)
5. Is the structure clean and consistent? (yes/no)

Each "no" or "generic" or "coursework only" answer is a red flag that MUST lower the score.

## OUTPUT FORMAT

Return ONLY valid JSON. No explanation outside the JSON.

{
  "role": "inferred job role",
  "level": "Fresher | Junior | Mid-level | Senior",
  "score": <number 0–100>,
  "scoreBreakdown": {
    "baseScore": 50,
    "earned": <points added>,
    "deducted": <points removed>,
    "capsApplied": ["list any hard caps that clamped the score"]
  },
  "techStack": ["skill1", "skill2"],
  "strengths": ["only real, specific strengths — max 3"],
  "weaknesses": ["be blunt, not gentle — max 4"],
  "missingKeywords": ["keywords expected for this role but absent"],
  "suggestions": ["actionable fixes, not generic tips — max 4"],
  "advice": "2–3 sentence brutally honest career advice"
}

## IMPORTANT BEHAVIOR RULES
- Do NOT give benefit of the doubt. Judge only what is written.
- Do NOT assume skills not listed.
- Do NOT soften weaknesses. Be direct.
- If the resume is weak, say so clearly in advice.
- Suggestions must be specific to THIS resume, not generic.

Resume:
`;

function getClient(): OpenAI {
  const apiKey = process.env.NVIDIA_API_KEY;
  
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY environment variable is not configured");
  }

  return new OpenAI({
    apiKey: apiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
    timeout: 180000,
    maxRetries: 3,
  });
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  const client = getClient();
  let responseText = "";

  try {
    const completion = await client.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct",
      messages: [
        {
          role: "user",
          content: ANALYSIS_PROMPT + resumeText,
        },
      ],
      temperature: 0.3,
      top_p: 0.95,
      max_tokens: 2048,
    });

    responseText = completion.choices[0]?.message?.content || "";

    if (!responseText) {
      throw new Error("No response received from AI model");
    }

    let cleanedResponse = responseText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const jsonStart = cleanedResponse.indexOf("{");
    const jsonEnd = cleanedResponse.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    }

    const analysis = JSON.parse(cleanedResponse) as ResumeAnalysis;

    if (
      !analysis.role ||
      !analysis.level ||
      typeof analysis.score !== "number" ||
      !Array.isArray(analysis.techStack) ||
      !Array.isArray(analysis.strengths) ||
      !Array.isArray(analysis.weaknesses) ||
      !Array.isArray(analysis.missingKeywords) ||
      !Array.isArray(analysis.suggestions) ||
      !analysis.advice
    ) {
      throw new Error("Invalid analysis structure returned from AI model");
    }

    analysis.score = Math.min(100, Math.max(0, analysis.score));

    return analysis;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("AI Response parsing error:", responseText);
      throw new Error("Failed to parse AI response as JSON");
    }
    throw error;
  }
}
