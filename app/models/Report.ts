// models/Report.ts
import { Schema, models, model } from "mongoose";

const ReportSchema = new Schema(
  {
    court: { type: Schema.Types.ObjectId, ref: "FoodCourt", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    crowd: { type: String, enum: ["Quiet", "Busy", "Packed", "Closed"], required: true },
    food: { type: String, enum: ["Good", "Average", "Bad"], required: true },
    note: { type: String, maxlength: 140 },
  },
  { timestamps: true }
);


ReportSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 1 }); // 1 day

export const Report = models.Report || model("Report", ReportSchema);