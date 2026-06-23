const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user-model");
const status_code = require("../utils/status-code");

// register controller
const Register = async (req, res) => {
  try {
    // basic validation
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) {
      res
        .status(status_code.BAD_REQUEST)
        .json({ message: "All fields are required" });
    }
    // check existing users
    const existUser = await User.findOne({ phone });
    if (existUser) {
      res.status(status_code.CONFLICT).json({ messgae: "User already exist" });
    }
    // encrypt password
    const hash_password = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, phone, password: hash_password });

    // genrate jwt token
    const token = await jwt.sign(
      { id: newUser._id, phone: newUser.phone, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.cookie().status(status_code.CREATED).json({
      message: "Register sucessful",
      user: { name: newUser.name, phone: newUser.phone, role: newUser.role },
    });
  } catch (error) {
    res
      .status(status_code.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error: error.message });
  }
};

const Login = async (req, res) => {
  try {
    res.send("hi controller");
  } catch (error) {}
};

module.exports = { Register, Login };
