import Order from "../models/Order.js";
import mongoose from "mongoose";
import { calculateROI } from "../utils/calculateROI.js";

export const createOrder = async (req, res) => {
  try {
    const { profit, roi } = calculateROI(
      req.body.buyPrice,
      req.body.sellPrice,
      req.body.refundAmount || 0
    );

    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const userId = new mongoose.Types.ObjectId(targetId);
    const order = await Order.create({
      ...req.body,
      user: userId,
      netProfit: profit,
      roi
    });

    res.json(order);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Order ID already exists for this account" });
    }
    console.error("Order Creation Error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const userId = new mongoose.Types.ObjectId(targetId);
    const filter = { user: userId, isDeleted: false };
    if (req.query.account) {
      filter.accountRef = req.query.account;
    }
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const userId = new mongoose.Types.ObjectId(targetId);
    const order = await Order.findOne({ _id: req.params.id, user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const { profit, roi } = calculateROI(
      req.body.buyPrice ?? order.buyPrice,
      req.body.sellPrice ?? order.sellPrice,
      req.body.refundAmount ?? order.refundAmount
    );

    Object.assign(order, req.body, { netProfit: profit, roi });
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const userId = new mongoose.Types.ObjectId(targetId);
    
    const order = await Order.findOne({ _id: req.params.id, user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isDeleted = true;
    await order.save();

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeletedOrders = async (req, res) => {
  try {
    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const userId = new mongoose.Types.ObjectId(targetId);
    const filter = { user: userId, isDeleted: true };
    if (req.query.account) {
      filter.accountRef = req.query.account;
    }
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreOrder = async (req, res) => {
  try {
    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const userId = new mongoose.Types.ObjectId(targetId);
    const order = await Order.findOne({ _id: req.params.id, user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isDeleted = false;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const permanentDeleteOrder = async (req, res) => {
  try {
    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const userId = new mongoose.Types.ObjectId(targetId);
    const order = await Order.findOneAndDelete({ _id: req.params.id, user: userId });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: "No order IDs provided" });
    }

    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const userId = new mongoose.Types.ObjectId(targetId);

    const result = await Order.deleteMany({
      _id: { $in: orderIds },
      user: userId
    });

    res.json({ message: `${result.deletedCount} orders permanently deleted` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
