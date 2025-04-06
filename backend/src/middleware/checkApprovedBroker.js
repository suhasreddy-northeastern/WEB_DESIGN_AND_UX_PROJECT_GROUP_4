const User = require("../models/User");

const checkApprovedBroker = async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (user.type !== "broker" || !user.isApproved) {
    return res.status(403).json({ message: "Only approved brokers can perform this action." });
  }
  next();
};

module.exports = checkApprovedBroker;
