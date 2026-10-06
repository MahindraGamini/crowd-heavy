import {NextResponse} from "next/server";
import {connectDB} from "../../../lib/db";
import {Report} from "../../../models/Report";
import {getSession} from "../../../lib/session";
import {FoodCourt} from "../../../models/FoodCourt";
import {publishRealtimeEvent} from "../../../lib/realtime";
const CROWD = ["Quiet", "Busy", "Packed", "Closed"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {

const userId = await getSession();
  if (!userId) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }
  const { id } = await params;
  const { crowd, note = "" } = await req.json();
  if (!CROWD.includes(crowd))
    return NextResponse.json({ error: "Invalid crowd level." }, { status: 400 });

  await connectDB();
  const court = await FoodCourt.findByIdAndUpdate(
    id,
    { crowd, note, updatedAt: new Date(), updatedBy: userId },
    { new: true }
  ).lean();
  if (!court) return NextResponse.json({ error: "Court not found." }, { status: 404 });

  
  await publishRealtimeEvent("court:update", JSON.parse(JSON.stringify(court)));
return NextResponse.json({ ok: true });

}
