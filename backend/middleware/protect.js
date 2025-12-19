const { verifyToken } = require("../utils/jwt");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Debug: If you get a 401, check your terminal to see if the header arrived
  if (!authHeader) {
    console.log("⚠️ No Authorization header found in request");
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: "Invalid or Expired Token" });
  }

  req.user = {
    ...decoded,
    id: decoded.id || decoded._id
  };

  next();
};

module.exports = protect;