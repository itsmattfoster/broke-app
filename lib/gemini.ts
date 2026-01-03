/**
 * Gemini AI Integration Utilities for React Native
 * 
 * Handles communication with Google's Gemini API
 * Uses REST API directly (compatible with React Native)
 */

export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

/**
 * Convert conversation messages to Gemini format
 */
export function convertConversationToGemini(
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>,
  systemPrompt?: string
): { contents: GeminiMessage[]; systemInstruction?: string } {
  const contents: GeminiMessage[] = [];

  // Convert conversation messages to Gemini format
  for (const msg of messages) {
    const parts: Array<{ text: string }> = [];

    // Handle text content
    if (msg.role === "assistant" && msg.content?.trim()) {
      // Convert assistant messages to user messages with context prefix
      parts.push({
        text: `[Previous Assistant Response]: ${msg.content}`,
      });
    } else if (msg.content?.trim()) {
      parts.push({
        text: msg.content,
      });
    }

    // Only add message if it has parts
    if (parts.length > 0) {
      contents.push({
        role: "user",
        parts,
      });
    }
  }

  return { contents, systemInstruction: systemPrompt };
}

/**
 * Generate content using Gemini API (client-side for React Native)
 */
export async function generateWithGemini(
  contents: GeminiMessage[],
  systemInstruction?: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          systemInstruction: systemInstruction
            ? {
                parts: [{ text: systemInstruction }],
              }
            : undefined,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No text in Gemini API response");
    }

    return text;
  } catch (error: any) {
    console.error("[gemini] API error:", {
      message: error?.message,
      status: error?.status,
    });

    throw new Error(
      `Gemini API error: ${error?.message || "Unknown error"}`
    );
  }
}

/**
 * Generate content from conversation history (convenience function)
 */
export async function generateFromConversation(
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>,
  systemPrompt?: string,
  apiKey: string
): Promise<string> {
  const { contents, systemInstruction } = convertConversationToGemini(
    messages,
    systemPrompt
  );

  return generateWithGemini(contents, systemInstruction, apiKey);
}

