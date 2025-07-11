// services/aimlApi.js
export async function analyzeWithAIML({ query }) {
  const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer f6a4c847a62a4ea5a260c013913c286b", // Your key here!
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: query }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch AI analysis.");
  }

  const result = await response.json();
  return result.choices[0].message.content;
}

