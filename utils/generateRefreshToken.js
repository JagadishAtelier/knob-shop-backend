const jwt = require("jsonwebtoken");

module.exports = function generateRefreshToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" } // Long expiry (recommended)
  );
};
