const jwt = require("jsonwebtoken");
const User = require("../model/userSchema"); // Make sure the path is correct

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Fetch full user details excluding sensitive fields
    const user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // Store full user object in request
    next();
  } catch (err) {
    console.error(err);
    return res.sendStatus(403); // invalid token
  }
};

module.exports = verifyJWT;
