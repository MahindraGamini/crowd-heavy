import { connectDB } from "./db";
import { RealtimeEvent } from "../models/RealtimeEvent";

export type RealtimeEventName = "court:update" | "note:update";

export async function publishRealtimeEvent(name: RealtimeEventName, data: unknown) {
  try {
    await connectDB();
    await RealtimeEvent.create({ name, data });
  } catch (error) {
    console.error(`Failed to persist realtime event "${name}".`, error);
    throw error;
  }
}
