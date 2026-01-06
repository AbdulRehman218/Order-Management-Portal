import Order from "../models/Order.js";
import Query from "../models/Query.js";
import mongoose from "mongoose";
import * as XLSX from "xlsx";

export const getSummary = async (req, res) => {
  try {
    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const userId = new mongoose.Types.ObjectId(targetId);
    const filter = { user: userId, isDeleted: false };
    if (req.query.account) {
      filter.accountRef = req.query.account;
    }
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
        filter.createdAt = end ? { $gte: start, $lte: end } : { $gte: start };
      }
    }
    const orders = await Order.find(filter);
    
    console.log(`Generating summary for User: ${userId}, Orders Found: ${orders.length}`);
    if (orders.length > 0) {
      console.log("Sample Order (first):", {
        orderId: orders[0].orderId,
        buyPrice: orders[0].buyPrice,
        sellPrice: orders[0].sellPrice,
        netProfit: orders[0].netProfit,
        roi: orders[0].roi,
        createdAt: orders[0].createdAt
      });
    }

    const totalProfit = orders.reduce((a, b) => a + (b.netProfit || 0), 0);
    const totalSales = orders.reduce((a, b) => a + (b.sellPrice || 0), 0);
    const avgROI = orders.length > 0
      ? (orders.reduce((a, b) => a + (parseFloat(b.roi) || 0), 0) / orders.length).toFixed(2)
      : 0;

    const summary = {
      totalOrders: orders.length,
      totalSales,
      netProfit: totalProfit,
      avgROI: `${avgROI}%`
    };

    console.log("Summary Data:", summary);
    res.json(summary);
  } catch (error) {
    console.error("Report Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const exportOrdersXlsx = async (req, res) => {
  try {
    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const userId = new mongoose.Types.ObjectId(targetId);
    const filter = { user: userId, isDeleted: false };
    if (req.query.account) {
      filter.accountRef = req.query.account;
    }
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
        filter.createdAt = end ? { $gte: start, $lte: end } : { $gte: start };
      }
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    const header = [
      "NO",
      "OrderID",
      "SKU",
      "Details",
      "ProcessID",
      "TrackingID",
      "Buy",
      "Sell",
      "Profit",
      "Status",
      "Date",
      "Time"
    ];
    const rows = orders.map((o, idx) => {
      const date = new Date(o.createdAt);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      return [
        idx + 1,
        o.orderId ?? "",
        o.sku ?? "",
        o.details ?? "",
        o.processId ?? o.aliExpressOrder ?? "",
        o.trackingId ?? "",
        Number(o.buyPrice ?? 0),
        Number(o.sellPrice ?? 0),
        Number(o.netProfit ?? 0),
        o.status ?? "",
        dateStr,
        timeStr
      ];
    });
    const data = [header, ...rows];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=orders-${new Date().toISOString()}.xlsx`);
    res.send(buf);
  } catch (error) {
    console.error("Export Orders TXT Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const exportQueriesXlsx = async (req, res) => {
  try {
    const targetId = (req.user.role === "admin" && req.query.user) ? req.query.user : req.user.id;
    const userId = new mongoose.Types.ObjectId(targetId);
    const filter = { user: userId, isDeleted: false };
    if (req.query.account) {
      filter.accountRef = req.query.account;
    }
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
        filter.createdAt = end ? { $gte: start, $lte: end } : { $gte: start };
      }
    }
    const queries = await Query.find(filter).sort({ createdAt: -1 });
    const header = [
      "NO",
      "OrderID",
      "SKU",
      "Message",
      "Handler",
      "Status",
      "Date",
      "Time"
    ];
    const rows = queries.map((q, idx) => {
      const date = new Date(q.createdAt);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      return [
        idx + 1,
        q.orderId ?? "",
        q.sku ?? "",
        q.message ?? "",
        q.handlerName ?? "",
        q.status ?? "",
        dateStr,
        timeStr
      ];
    });
    const data = [header, ...rows];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Queries");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=queries-${new Date().toISOString()}.xlsx`);
    res.send(buf);
  } catch (error) {
    console.error("Export Queries XLSX Error:", error);
    res.status(500).json({ message: error.message });
  }
};
