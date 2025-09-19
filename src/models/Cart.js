import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, default: 1 }
  }]
}, { timestamps: true });

export default mongoose.model("Cart", schema);
