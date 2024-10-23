const jwt = require("jsonwebtoken");
const HttpError = require("../models/errorModel");

const authMiddleware = async (req, res, next) => {
  const Authorization = req.headers.Authorization || req.headers.authorization;

  if (Authorization && Authorization.startsWith("Bearer ")) {
    const token = Authorization.split(" ")[1]; // Correctly split the Bearer token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return next(new HttpError("Unauthorized. Invalid token", 403));
      }
      req.user = user; // Attach user info to req
      next(); // Proceed to the next middleware or route handler
    });
  } else {
    return next(new HttpError("Unauthorized. No token provided", 401));
  }
};

module.exports = authMiddleware;
