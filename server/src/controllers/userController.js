import User from "../models/User.js";
import Order from "../models/Order.js";
import Query from "../models/Query.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(new mongoose.Types.ObjectId(id));
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, password, role, image, accountName, accountType, accountId } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (image !== undefined) user.image = image;
    if (accountName !== undefined) user.accountName = accountName;
    if (accountType !== undefined) user.accountType = accountType;
    if (accountId !== undefined) user.accountId = accountId;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await Order.deleteMany({ user: userId });
    await Query.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "User and all associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addAccount = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { platform, accountName, accountId, image } = req.body;
    if (!platform || !accountName || !accountId) {
      return res.status(400).json({ message: "platform, accountName and accountId are required" });
    }
    user.accounts = user.accounts || [];
    const exists = user.accounts.some(
      (a) =>
        (a.platform || "").toLowerCase() === platform.toLowerCase() &&
        (a.accountId || "").toLowerCase() === accountId.toLowerCase()
    );
    if (exists) {
      return res.status(409).json({ message: "Account already exists for this user" });
    }
    user.accounts.push({ platform, accountName, accountId, image: image || "" });
    await user.save();
    const u = user.toObject();
    delete u.password;
    res.status(201).json(u);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);
    const accountObjectId = new mongoose.Types.ObjectId(req.params.accountId);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.accounts = (user.accounts || []).map((a) => {
      if (a._id?.toString() === accountObjectId.toString()) {
        return {
          ...a.toObject?.() || a,
          platform: req.body.platform ?? a.platform,
          accountName: req.body.accountName ?? a.accountName,
          accountId: req.body.accountId ?? a.accountId,
          image: req.body.image ?? a.image
        };
      }
      return a;
    });
    await user.save();
    const u = user.toObject();
    delete u.password;
    res.json(u);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listAccounts = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);
    const user = await User.findById(userId).select("accounts");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.accounts || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);
    const accountObjectId = new mongoose.Types.ObjectId(req.params.accountId);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.accounts = (user.accounts || []).filter((a) => a._id?.toString() !== accountObjectId.toString());
    await user.save();
    res.json({ message: "Account removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
