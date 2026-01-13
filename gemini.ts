
import { GoogleGenAI, Type } from "@google/genai";
import { FixResult } from "../types";

// Using the recommended initialization pattern for GoogleGenAI with process.env.API_KEY
export const fixPythonCode = async (code: string): Promise<FixResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze this Python code for errors, performance issues, and PEP 8 violations: \n\n\`\`\`python\n${code}\n\`\`\``,
    config: {
      systemInstruction: "You are a world-class Python developer and debugger. Analyze the code provided. Identify syntax errors, logical flaws, and style issues (PEP 8). Provide the corrected code, a pedagogical explanation, a list of specific errors with line numbers, and linting suggestions. Return the result strictly as JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          correctedCode: {
            type: Type.STRING,
            description: "The full corrected and optimized Python code."
          },
          explanation: {
            type: Type.STRING,
            description: "A friendly, educational explanation of what was wrong."
          },
          errors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                line: { type: Type.NUMBER },
                type: { type: Type.STRING },
                message: { type: Type.STRING }
              },
              required: ["line", "type", "message"]
            }
          },
          lintingSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["correctedCode", "explanation", "errors", "lintingSuggestions"]
      },
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });

  // Extract the text property directly from the response and trim any whitespace
  const jsonStr = response.text.trim();
  return JSON.parse(jsonStr) as FixResult;
};
