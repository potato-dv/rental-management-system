const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // check if there are authorized header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // get the token
      token = req.headers.authorization.split(" ")[1];

      // 3. verifying the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. look the user in the db
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found. Not authorized.",
        });
      }

      // 5. attaching the user to req
      req.user = user;
      
      // 6. call next() to proceed to controller
      return next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed.",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided.",
    });
  }
};

module.exports = { protect };