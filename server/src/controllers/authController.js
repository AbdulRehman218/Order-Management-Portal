import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/mailer.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, image, accountName, accountType, accountId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hashed, 
      role: role || "user",
      image: image || "",
      accountName: accountName || "",
      accountType: accountType || "",
      accountId: accountId || ""
    });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 1 * 60 * 1000); // 1 minute
    await user.save();
    const subject = "Your password reset verification code";
    const text = `Hello ${user.name || ""},\n\nYour password reset verification code is: ${code}\nThis code will expire in 1 minute.\n\nIf you did not request this, please ignore this email.`;
    const html = `<p>Hello ${user.name || ""},</p><p>Your password reset verification code is: <b>${code}</b></p><p>This code will expire in 1 minute.</p><p>If you did not request this, please ignore this email.</p>`;
    const result = await sendMail({ to: email, subject, text, html });
    if (!result.success) {
      console.error("Forgot Password Email Failed:", result.error);
      return res.status(500).json({ 
        message: "Failed to send email. " + (result.error?.message || "Check server logs or SMTP settings.") 
      });
    }
    return res.json({ message: "Verification code sent to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) {
      return res.status(400).json({ message: "Email, code and new password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid request" });
    if (!user.resetCode || !user.resetCodeExpires) {
      return res.status(400).json({ message: "No reset request found" });
    }
    if (user.resetCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }
    if (new Date() > new Date(user.resetCodeExpires)) {
      return res.status(400).json({ message: "Verification code expired" });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetCode = "";
    user.resetCodeExpires = null;
    await user.save();
    return res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid request" });
    if (!user.resetCode || !user.resetCodeExpires) {
      return res.status(400).json({ message: "No reset request found" });
    }
    if (user.resetCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }
    if (new Date() > new Date(user.resetCodeExpires)) {
      return res.status(400).json({ message: "Verification code expired" });
    }
    return res.json({ message: "Code verified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
