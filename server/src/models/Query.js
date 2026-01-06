import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  orderId: String,
  sku: String,
  details: String,
  message: String,
  answer: String,
  handlerName: String,
  accountRef: { type: String, default: "" },
  expiresAt: { type: Date },
  notifiedExpire: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["inprogress", "notresolved", "resolved", "follow"],
    default: "inprogress"
  }
}, { timestamps: true });

export default mongoose.model("Query", querySchema);
