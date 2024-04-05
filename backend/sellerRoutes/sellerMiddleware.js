const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const { SellerDb } = require("../db/db"); // Assuming you have a User model

const sellerAuthMiddleware = async (req, res, next) => {
  // Extract token from request body
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ msg: "No token provided" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if the user exists in the database
    const seller = await SellerDb.findOne({
      username: decoded.username,
    }).select("username _id");
    if (!seller) {
      return res.status(401).json({ msg: "User does not exist" });
    }

    // Attach user information to request object for further processing
    req.seller = seller;

    // Proceed to next middleware
    next();
  } catch (err) {
    console.error("Error authorizing user:", err);
    return res.status(403).json({ msg: "Unauthorized" });
  }
};

module.exports = sellerAuthMiddleware;
