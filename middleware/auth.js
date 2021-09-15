const jwt = require("jsonwebtoken");
const config = require("config");
const Token = require("../models/Token");

module.exports = async (req, res, next) => {
  //Get token from header
  const token = req.header("x-auth-token");

  const tokenId = await Token.findOne({ token: token });
  //Check if no token
  if (!token || !tokenId) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  //verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user;
    req.token = token;
    next();
  } catch (err) {
    await Token.findOneAndDelete({ token: token });
    res.status(401).json({ msg: "Token is not valid" });
  }
};
