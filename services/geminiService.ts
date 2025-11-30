import { GoogleGenAI } from "@google/genai";

// Initialize client once if possible, but keep robust checks
let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (aiClient) return aiClient;
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return null;
  }
  aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
};

// Streaming translation for faster UX
export const translateTextStream = async function* (text: string, sourceLang: string = 'Tamil mixed with English', targetLang: string = 'English') {
  const ai = getAiClient();
  if (!ai) {
    yield "Error: API Key missing.";
    return;
  }

  try {
    const prompt = `Translate this ${sourceLang} text to ${targetLang}. Output only translation.\nText: "${text}"`;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Translation stream error:", error);
    yield " Error connecting to server.";
  }
};

// Original non-streaming (fallback)
export const translateText = async (text: string, sourceLang: string = 'Tamil mixed with English', targetLang: string = 'English'): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key missing.";

  try {
    const prompt = `Translate this ${sourceLang} text to ${targetLang}. Output only translation.\nText: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Translation failed.";
  } catch (error) {
    console.error("Translation error:", error);
    return "Error during translation.";
  }
};

// Streaming refinement
export const refineTranscriptStream = async function* (text: string) {
  const ai = getAiClient();
  if (!ai) {
    yield text;
    return;
  }

  try {
    const prompt = `Fix grammar/punctuation. Keep meaning. Output only corrected text.\nInput: "${text}"`;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Refine stream error:", error);
    yield text;
  }
};

export const refineTranscript = async (text: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return text;

  try {
    const prompt = `Fix grammar/punctuation. Keep meaning. Output only corrected text.\nInput: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || text;
  } catch (error) {
    console.error("Refine error:", error);
    return text;
  }
};