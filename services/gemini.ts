import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a Base64 string (data URL) to the raw base64 data string required by Gemini.
 * Removes the "data:image/xxx;base64," prefix.
 */
const extractBase64Data = (dataUrl: string): string => {
  return dataUrl.split(',')[1];
};

/**
 * Calls the Gemini API to remove watermarks from an image.
 */
export const removeWatermark = async (
  base64Image: string, 
  mimeType: string
): Promise<string> => {
  try {
    const cleanBase64 = extractBase64Data(base64Image);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: "Remove any watermarks, logos, text overlays, or timestamps from this image. Reconstruct the obscured areas naturally to match the surrounding background texture and lighting. Return ONLY the cleaned image.",
          },
        ],
      },
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No content returned from Gemini.");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Model did not return an image. It might have refused the request.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    alert("API Error: " + (error.message || "Unknown error"));
    throw new Error(error.message || "Failed to process image");
  }
};
