import OpenAI from "openai";
import type { ResumeAnalysis } from "@/types";

const ANALYSIS_PROMPT = `Analyze this resume and return ONLY valid JSON with: {"role":"job title","level":"experience level","score":0-100,"techStack":["skills"],"strengths":["strengths"],"weaknesses":["weaknesses"],"missingKeywords":["missing keywords"],"suggestions":["suggestions"],"advice":"career advice"}.

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
      model: "minimaxai/minimax-m2.7",
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
