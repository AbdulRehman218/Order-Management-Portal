import Query from "../models/Query.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

export const createQuery = async (req, res) => {
  try {
    let sku = req.body.sku;
    let details = req.body.details;
    
    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const accountRef = req.body.accountRef || (req.query.account || "");
    // Automatically fetch SKU if orderId is provided
    if (req.body.orderId) {
      const order = await Order.findOne({ 
        orderId: req.body.orderId,
        user: targetId,
        ...(accountRef ? { accountRef } : {})
      });
      if (!order) {
        return res.status(400).json({ message: "Order ID not found for selected account" });
      }
      if (order && order.sku) {
        sku = order.sku;
      }
      if (order && order.details) {
        details = order.details;
      }
    }

    const query = await Query.create({
      ...req.body,
      sku: sku || "N/A", // Use fetched SKU or fallback
      details: details || "N/A",
      user: targetId,
      accountRef
    });
    console.log(`[Query] Created query ${query._id} with expiresAt: ${query.expiresAt}`);
    res.json(query);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getQueries = async (req, res) => {
  try {
    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const filter = { user: targetId };
    if (req.query.account) {
      filter.accountRef = req.query.account;
    }
    const queries = await Query.find(filter).sort({ createdAt: -1 });
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuery = async (req, res) => {
  try {
    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const query = await Query.findOne({ _id: req.params.id, user: targetId });
    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }
    const fields = ["orderId", "sku", "details", "message", "answer", "handlerName", "status", "expiresAt"];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        query[f] = req.body[f];
      }
    }
    await query.save();
    res.json(query);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteQuery = async (req, res) => {
  try {
    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const userId = new mongoose.Types.ObjectId(targetId);
    const query = await Query.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!query) {
      return res.status(404).json({ message: "Query not found" });
    }
    res.json({ message: "Query deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
