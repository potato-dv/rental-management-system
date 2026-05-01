const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Helper function para gumawa ng Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "1d",
  });
};

// @desc    Register a new user (Tenant)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => { 
  try {
    const { name, email, contactNumber, password } = req.body;

    // 2. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide all required fields (Name, Email, Password)" 
      });
    }

    // 3. check for email uniqueness
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered. Please login." 
      });
    }

    // 4. Create User in Database
    const user = await User.create({
      name,
      email,
      contactNumber, 
      password,
      role: "tenant", 
    });

    // 5. Generate Token
    const token = generateToken(user._id);

   
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        role: user.role,
      },
    });
  } catch (error) {
  console.error("Register Error:", error);
  res.status(500).json({ success: false, message: "Internal Server Error" });
}
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    // find user and get password
    const user = await User.findOne({ email }).select("+password");

    // check email and password if match
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          contactNumber: user.contactNumber,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc    Get current logged in user (Para sa AuthContext mo)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user from authMiddleware
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  register,
  login,
  getMe,
};