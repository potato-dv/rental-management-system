const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware para protektahan ang mga private routes.
 * Sinisiguro nito na may valid JWT token ang request.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check kung may Authorization header at kung nagsisimula sa "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. Kunin ang token mula sa header (Bearer <token>)
      token = req.headers.authorization.split(" ")[1];

      // 3. I-verify ang token gamit ang secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Hanapin ang user sa database gamit ang ID mula sa token (huwag isama ang password)
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found. Not authorized.",
        });
      }

      // 5. I-attach ang user object sa request para magamit ng susunod na function
      req.user = user;
      
      // 6. Tawagin ang next() para magpatuloy sa controller
      return next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed.",
      });
    }
  }

  // 7. Kung walang token na nakita sa header
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided.",
    });
  }
};

module.exports = { protect };