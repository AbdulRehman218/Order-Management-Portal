import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  orderId: { type: String, required: true, trim: true },
  ebayOrder: String,
  aliExpressOrder: String,
  processId: String,
  sku: String,
  details: String,
  notes: String,
  handlerName: String,
  trackingId: String,
  accountRef: { type: String, default: "" },

  buyPrice: Number,
  sellPrice: Number,
  refundAmount: { type: Number, default: 0 },

  netProfit: Number,
  roi: Number,

  status: {
    type: String,
    enum: ["processing", "pending", "completed"]
  },

  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

orderSchema.index({ user: 1, accountRef: 1, orderId: 1 }, { unique: true });

export default mongoose.model("Order", orderSchema);
