import Order from "../models/Order.js";
import mongoose from "mongoose";

export const profitChart = async (req, res) => {
  try {
    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const userId = new mongoose.Types.ObjectId(targetId);
    const dateFilter = {};
    if (req.query.range) {
      const now = new Date();
      let start = null;
      let end = null;
      const r = String(req.query.range).toLowerCase();
      if (r === "yesterday") {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        y.setHours(0, 0, 0, 0);
        start = y;
        end = new Date(y);
        end.setHours(23, 59, 59, 999);
      } else {
        let days = 0;
        if (r === "1d") days = 1;
        else if (r === "2d") days = 2;
        else if (r === "week" || r === "7d") days = 7;
        else if (r === "month" || r === "30d") days = 30;
        else if (r === "year" || r === "365d") days = 365;
        if (days > 0) {
          start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          end = now;
        }
      }
      if (start) {
        dateFilter.createdAt = end ? { $gte: start, $lte: end } : { $gte: start };
      }
    }
    const data = await Order.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false,
          ...(req.query.account ? { accountRef: req.query.account } : {}),
          ...(dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : {})
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          profit: { $sum: "$netProfit" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
