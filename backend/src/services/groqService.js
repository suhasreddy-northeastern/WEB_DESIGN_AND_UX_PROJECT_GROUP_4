const axios = require("axios");
require("dotenv").config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

exports.getMatchExplanation = async (preference, apartment) => {
  const prompt = `
    You are an AI assistant helping users compare apartment listings with their preferences.

    Your task:
    1. Identify the features that match exactly between the user preference and apartment listing.
    2. Identify the features that differ or are missing.
    3. Identify bonus features that exceed user preferences (e.g., more amenities, better view, higher floor, larger sqft, etc.).
    4. Return a short explanation with:
      ✅ Matched = Exactly as user requested  
      ❌ Mismatched = Clearly missing or different  
      💎 Bonus = Better than requested (extra features, upgrades, etc.)
      🟡 Partial Match = Some overlap, unclear or softer difference + A field should never appear in both ❌ and 🟡
      
    Always check the following fields specifically:
    - Type
    - Bedrooms
    - Price (can be single value or range, match if within range)
    - Neighborhood
    - Amenities
    - Style
    - Floor
    - Move-in Date
    - Parking
    - Public Transport
    - Safety
    - Pets
    - View
    - Lease Capacity
    - Roommates

    📝 Format your output like this (strictly!):
    ✅ Matches in: A, B, C  
    ❌ Missing: D, E  
    💎 Bonus features: X, Y
    🟡 Partial Match: P, Q

    Keep it short and clean — no paragraphs, no preamble, no metadata, no extra notes.

    
    User Preferences:
    ${JSON.stringify(preference, null, 2)}
    
    Apartment Listing:
    ${JSON.stringify(apartment, null, 2)}
    `;

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant for real estate matching.",
          },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API}`,
        },
      }
    );

    const explanation = response.data.choices[0].message.content;
    return explanation;
  } catch (error) {
    console.error("Groq API error:", error.response?.data || error.message);
    return "Could not generate explanation.";
  }
};
