const jwt = require("jsonwebtoken");
const User = require("../models/user-model");
const status_code = require("../utils/status-code");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(status_code.UNAUTHORIZED).json({ message: "No token provided, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and attach to request
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(status_code.UNAUTHORIZED).json({ message: "User not found, authorization denied" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(status_code.UNAUTHORIZED).json({ message: "Invalid or expired token, authorization denied", error: error.message });
  }
};

module.exports = authMiddleware;
