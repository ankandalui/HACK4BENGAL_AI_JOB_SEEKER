export async function askGemini(prompt: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Gemini API key is missing");
    return "I'm having trouble connecting to my brain right now.";
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 100,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status);
      return "I'm having trouble thinking right now. How else can I help you?";
    }

    const data = await response.json();

    // Extract the text response directly - no JSON parsing
    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    return output;
  } catch (error) {
    console.error("Failed to communicate with Gemini:", error);
    return "I'm having a bit of trouble connecting. Can you repeat that?";
  }
}
