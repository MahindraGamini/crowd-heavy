// models/FoodCourt.ts
import { Schema, models, model } from "mongoose";

const FoodCourtSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  location: String,
  vendors: { type: [String], index: true, default: [] },
  crowd: { type: String, enum: ["Quiet", "Busy", "Packed", "Closed"], default: "Quiet" },
  note: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

export const FoodCourt = models.FoodCourt || model("FoodCourt", FoodCourtSchema);