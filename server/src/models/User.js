import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  image: { type: String, default: "" },
  accountName: { type: String, default: "" },
  accountType: { type: String, default: "" },
  accountId: { type: String, default: "" },
  accounts: [{
    platform: { type: String, trim: true },
    accountName: { type: String, trim: true },
    accountId: { type: String, trim: true },
    image: { type: String, default: "" }
  }],
  resetCode: { type: String, default: "" },
  resetCodeExpires: { type: Date }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
