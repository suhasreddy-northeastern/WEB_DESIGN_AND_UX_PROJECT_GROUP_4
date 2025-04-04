const axios = require("axios");
require("dotenv").config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

exports.generateListingTitle = async (apartment) => {
  const prompt = `
You are a creative assistant helping brokers write attractive apartment listing titles.

Your task:
- Generate a short, catchy title (max 8 words)
- Make it feel real-estate ready and appealing
- Highlight key elements like layout, location, or standout features

Examples:
- Spacious 2BHK Near Central Park
- Modern Loft with Skyline View
- Peaceful Studio in Quiet Neighborhood

Now create a title for this apartment:
${JSON.stringify(apartment, null, 2)}
`;

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are a creative assistant generating real estate listing titles.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY2}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Groq API error (title):", error.response?.data || error.message);
    return "Could not generate title.";
  }
};
