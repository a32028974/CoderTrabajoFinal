// src/models/ResetToken.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ResetTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true }, // sha256 del token
    expiresAt: { type: Date, required: true },   // +1 hora
  },
  { timestamps: true }
);

// TTL: cuando expiresAt < now, Mongo elimina el documento
ResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ResetToken = model("ResetToken", ResetTokenSchema);
export default ResetToken;
