const express = require("express");
const User = require("../models/User");
const checkAuth = require("../middleware/checkAuth");

const router = express.Router();

// ------------------------------------------------------------
// 🔍 Get all pending broker approval requests
// ------------------------------------------------------------
router.get("/pending-brokers", checkAuth("admin"), async (req, res) => {
  try {
    const pending = await User.find({ type: "broker", isApproved: false });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending brokers" });
  }
});

// GET all brokers
router.get("/brokers", checkAuth("admin"), async (req, res) => {
  try {
    const brokers = await User.find({ type: "broker" });
    res.json(brokers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch brokers" });
  }
});

// ✅ Approve broker by ID
router.post("/approve-broker/:id", checkAuth("admin"), async (req, res) => {
  try {
    const broker = await User.findById(req.params.id);
    if (!broker || broker.type !== "broker") {
      return res.status(404).json({ message: "Broker not found" });
    }

    broker.isApproved = true;
    await broker.save();

    res.json({ message: "Broker approved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
});

// ❌ Revoke broker approval
router.post("/revoke-broker/:id", checkAuth("admin"), async (req, res) => {
  try {
    const broker = await User.findById(req.params.id);
    if (!broker || broker.type !== "broker") {
      return res.status(404).json({ message: "Broker not found" });
    }

    broker.isApproved = false;
    await broker.save();

    res.json({ message: "Broker approval revoked" });
  } catch (err) {
    res.status(500).json({ message: "Revoking approval failed" });
  }
});


router.get("/users", checkAuth("admin"), async (req, res) => {
  try {
    const users = await User.find({ type: "user" }); // or maybe all users if needed
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

module.exports = router;