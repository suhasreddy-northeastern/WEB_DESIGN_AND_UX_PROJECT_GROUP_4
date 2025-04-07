const User = require("../models/User");

const checkApprovedBroker = async (req, res, next) => {
  try {
    // Ensure req.user is available (from checkAuth middleware)
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.type !== "broker" || !user.isApproved) {
      return res.status(403).json({ message: "Only approved brokers can perform this action." });
    }

    next();
  } catch (error) {
    console.error("Error in checkApprovedBroker middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = checkApprovedBroker;
