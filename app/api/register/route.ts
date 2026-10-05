import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { connectDB } from "../../lib/db";
import { createSession } from "../../lib/session";
import { User } from "../../models/user";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const clean = String(email || "").trim().toLowerCase();

  if (String(password || "").length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  await connectDB();

  const existingUser = await User.findOne({ email: clean });
  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const newUser = await User.create({
    email: clean,
    passwordHash: await bcrypt.hash(String(password), 12),
  });

  await createSession(String(newUser._id));
  return NextResponse.json({ ok: true });
}