const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const JWT_SECRET = "@A1vM!2#$x!";

const generateToken = (user) =>
  jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const existing = await User.findByEmail(email);
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    await User.createUser({ firstName, lastName, email, password });
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const { connection } = require("../config/db");

exports.getMe = (req, res) => {
  const userId = req.user.id;

  connection.query(
    "SELECT id, firstName, lastName, email FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Server error", error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(results[0]);
    }
  );
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Received email:", email);

    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    console.log("Generated token:", token, "Expiry:", expiry);

    await User.setResetToken(email, token, expiry);

    const link = `http://localhost:5000/reset-password/${token}`;
    console.log("Reset link:", link);

    await sendEmail(
      user.email,
      "Password Reset",
      `<p>Click <a href="${link}">here</a> to reset password.</p>`
    );

    res.json({ message: "Reset link sent" });
  } catch (err) {
    console.error("❌ forgotPassword error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findByResetToken(token);
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    await User.resetPassword(user.id, password);
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
