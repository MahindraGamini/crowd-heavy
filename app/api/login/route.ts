// app/api/auth/login/route.ts
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "../../lib/session";
import { connectDB } from "../../lib/db";
import { User } from "@/app/models/user";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const clean = String(email || "").trim().toLowerCase();

  await connectDB();
  const user = await User.findOne({ email: clean });
  const ok = user && (await bcrypt.compare(String(password || ""), user.passwordHash));


  if (!ok)
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}