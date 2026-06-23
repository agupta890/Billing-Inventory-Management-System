const status_code = require("../utils/status-code");

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(status_code.UNAUTHORIZED).json({ message: "Authentication required" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires one of these roles: ${allowedRoles.join(", ")}` });
    }
    next();
  };
};

module.exports = checkRole;
