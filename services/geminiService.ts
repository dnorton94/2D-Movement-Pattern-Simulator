import { GoogleGenAI } from "@google/genai";
import { Coordinate } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client only if the key exists to avoid immediate errors on load if missing
// The UI should handle the missing key state gracefully.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeGridPosition = async (
  squarePos: Coordinate,
  touchedPoints: Coordinate[],
  targetPos?: Coordinate | null
): Promise<string> => {
  if (!ai) {
    throw new Error("API Key is missing. Please configure process.env.API_KEY.");
  }

  const model = "gemini-2.5-flash";
  
  let prompt = `
    I have a 10m x 10m grid (coordinates 0 to 10).
    There is a 1m x 1m square located at Top-Left coordinates: (x: ${squarePos.x.toFixed(2)}, y: ${squarePos.y.toFixed(2)}).
    
    The square currently covers or touches the following integer grid points:
    ${touchedPoints.map(p => `(${p.x}, ${p.y})`).join(', ')}.
  `;

  if (targetPos) {
    prompt += `
    The user has set a specific TARGET position at Top-Left coordinates: (x: ${targetPos.x.toFixed(2)}, y: ${targetPos.y.toFixed(2)}).
    
    Please compare the current square position to this target position (distance, direction to move).
    `;
  }

  prompt += `
    The corners of the square are named:
    - A (Top-Left)
    - B (Top-Right)
    - C (Bottom-Right)
    - D (Bottom-Left)

    Please provide a brief, insightful geometric analysis. 
    Mention which grid points are closest to which corners. 
    If a target is set, give specific advice on how to reach it.
    Keep it under 3 sentences.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to analyze position at this time.";
  }
};