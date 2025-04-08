const User = require("../models/User");

const checkAuth = (requiredRole) => {
  return async (req, res, next) => {
    const sessionUser = req.session.user;

    if (!sessionUser) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const user = await User.findById(sessionUser._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If specific role is required, check it
    if (requiredRole && user.type !== requiredRole) {
      return res.status(403).json({ message: "Access denied: Insufficient permissions" });
    }

    // Attach full user to req
    req.user = user;
    next();
  };
};

module.exports = checkAuth;
