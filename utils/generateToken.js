const jwt = require("jsonwebtoken");

module.exports = function generateToken(userId, role) {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "15h" } // SHORT EXPIRY → so refresh makes sense
  );
};
