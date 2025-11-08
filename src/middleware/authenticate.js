const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  const token =
    req.headers.authorization?.split(" ")[1] ||
    req.query.state ||
    req.query.token;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};