// app/api/foodcourt/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import { FoodCourt } from "../../models/FoodCourt";

export async function GET() {
  await connectDB();
  return NextResponse.json(await FoodCourt.find().sort({ name: 1 }).lean());
}