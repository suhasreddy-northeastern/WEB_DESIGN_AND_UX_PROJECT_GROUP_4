const Apartment = require("../models/Apartment");
const Preference = require("../models/Preference");
const { generateListingTitle } = require("../services/groqTitle");
const { calculateMatchScore } = require("../utils/matchScoring");
const { getMatchExplanation } = require("../services/groqService");
const axios = require("axios");

// 📦 Create Apartment
exports.createApartment = async (req, res) => {
  try {
    const apartment = await Apartment.create(req.body);
    res.status(201).json(apartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 📄 Get All Apartments
exports.getAllApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find();
    res.status(200).json(apartments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🎯 Get Matches by User Email (with full results)
exports.getMatchesByUserEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Missing user email" });

    const latestPref = await Preference.findOne({ userEmail: email }).sort({
      submittedAt: -1,
    });
    if (!latestPref)
      return res.status(404).json({ message: "No preferences found" });

    const apartments = await Apartment.find();

    const scored = await Promise.all(
      apartments.map(async (apartment) => {
        const score = calculateMatchScore(latestPref, apartment);
        const explanation = await getMatchExplanation(latestPref, apartment);
        return {
          apartment,
          matchScore: score,
          explanation,
        };
      })
    );

    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.status(200).json(scored);
  } catch (err) {
    console.error("Match error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✨ Generate Listing Title (AI)
exports.generateTitleController = async (req, res) => {
  try {
    const title = await generateListingTitle(req.body.apartment);
    res.status(200).json({ title });
  } catch (error) {
    console.error("Title generation error:", error);
    res.status(500).json({ error: "Failed to generate title" });
  }
};
