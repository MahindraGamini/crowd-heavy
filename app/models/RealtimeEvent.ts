import { Schema, model, models } from "mongoose";

const RealtimeEventSchema = new Schema(
  {
    name: { type: String, enum: ["court:update", "note:update"], required: true },
    data: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 },
  },
  { versionKey: false }
);

export const RealtimeEvent = models.RealtimeEvent || model("RealtimeEvent", RealtimeEventSchema);
