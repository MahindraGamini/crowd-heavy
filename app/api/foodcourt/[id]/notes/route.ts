import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { getSession } from "../../../../lib/session";
import { publishRealtimeEvent } from "../../../../lib/realtime";
import { Report } from "../../../../models/Report";
import { FoodCourt } from "../../../../models/FoodCourt";
import { User } from "../../../../models/user";

const FOOD = ["Good", "Average", "Bad"] as const;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const court = await FoodCourt.exists({ _id: id });
  if (!court) return NextResponse.json({ error: "Court not found." }, { status: 404 });

  const notes = await Report.find({ court: id, note: { $exists: true, $ne: "" } })
    .sort({ createdAt: -1 })
    .select("food note createdAt")
    .populate("user", "username")
    .lean();
  return NextResponse.json(notes.map((item) => ({
    ...item,
    username: (item.user as { username?: string } | null)?.username ?? "Anonymous",
    user: undefined,
  })));
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const food = body?.food;
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  if (!FOOD.includes(food) || !note || note.length > 140) {
    return NextResponse.json({ error: "Choose a food rating and enter a note up to 140 characters." }, { status: 400 });
  }

  await connectDB();
  const court = await FoodCourt.exists({ _id: id });
  if (!court) return NextResponse.json({ error: "Court not found." }, { status: 404 });

  const review = await Report.create({ court: id, user: userId, crowd: "Quiet", food, note });
  const user = await User.findById(userId).select("username").lean();
  const payload = { _id: review._id, username: user?.username ?? "Anonymous", food: review.food, note: review.note, createdAt: review.createdAt };
  await publishRealtimeEvent("note:update", { courtId: id, note: JSON.parse(JSON.stringify(payload)) });
  return NextResponse.json(payload, { status: 201 });
}
