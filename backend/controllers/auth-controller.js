const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user-model");
const status_code = require("../utils/status-code");

// Register controller
const Register = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;
    
    // Basic validation
    if (!name || !phone || !password) {
      return res
        .status(status_code.BAD_REQUEST)
        .json({ message: "Name, phone, and password are required" });
    }

    if (phone.length !== 10) {
      return res
        .status(status_code.BAD_REQUEST)
        .json({ message: "Phone number must be exactly 10 digits" });
    }

    if (password.length < 6) {
      return res
        .status(status_code.BAD_REQUEST)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Validate role if provided
    let userRole = "employee";
    if (role) {
      if (!["owner", "employee"].includes(role)) {
        return res
          .status(status_code.BAD_REQUEST)
          .json({ message: "Invalid role. Role must be 'owner' or 'employee'" });
      }
      userRole = role;
    }

    // Check existing users
    const existUser = await User.findOne({ phone });
    if (existUser) {
      return res
        .status(status_code.CONFLICT)
        .json({ message: "User already exists with this phone number" });
    }

    // Encrypt password
    const hash_password = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, phone, password: hash_password, role: userRole });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, phone: newUser.phone, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set cookie and respond
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    })
    .status(status_code.CREATED)
    .json({
      message: "Registration successful",
      user: { id: newUser._id, name: newUser.name, phone: newUser.phone, role: newUser.role },
      token
    });
  } catch (error) {
    res
      .status(status_code.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Login controller
const Login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res
        .status(status_code.BAD_REQUEST)
        .json({ message: "Phone and password are required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res
        .status(status_code.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(status_code.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set cookie and respond
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    })
    .status(status_code.OK)
    .json({
      message: "Login successful",
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
      token
    });
  } catch (error) {
    res
      .status(status_code.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Logout controller
const Logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(status_code.OK).json({ message: "Logout successful" });
  } catch (error) {
    res
      .status(status_code.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Profile controller
const GetProfile = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    res.status(status_code.OK).json({ user: req.user });
  } catch (error) {
    res
      .status(status_code.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update profile controller
const UpdateProfile = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(status_code.NOT_FOUND).json({ message: "User not found" });
    }

    if (name) user.name = name;
    
    if (phone) {
      if (phone.length !== 10) {
        return res.status(status_code.BAD_REQUEST).json({ message: "Phone number must be 10 digits" });
      }
      
      const existUser = await User.findOne({ phone, _id: { $ne: userId } });
      if (existUser) {
        return res.status(status_code.CONFLICT).json({ message: "Phone number is already taken" });
      }
      user.phone = phone;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(status_code.BAD_REQUEST).json({ message: "Password must be at least 6 characters" });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(status_code.OK).json({
      message: "Profile updated successfully",
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role }
    });
  } catch (error) {
    res
      .status(status_code.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { Register, Login, Logout, GetProfile, UpdateProfile };
