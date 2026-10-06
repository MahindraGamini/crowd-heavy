import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { connectDB } from "../../lib/db";
import { createSession } from "../../lib/session";
import { User } from "../../models/user";

export async function POST(req: Request) {
  const { username, email, password, confirmPassword } = await req.json();
  const clean = String(username || "").trim().toLowerCase();
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!/^[a-z0-9_]{3,30}$/.test(clean)) {
    return NextResponse.json({ error: "Username must be 3–30 characters: letters, numbers, or underscores." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(String(password || ""))) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character." },
      { status: 400 }
    );
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }

  await connectDB();

  const existingUser = await User.findOne({ $or: [{ username: clean }, { email: cleanEmail }] });
  if (existingUser) {
    return NextResponse.json(
      { error: existingUser.username === clean ? "That username is already taken." : "An account with that email already exists." },
      { status: 409 }
    );
  }

  const newUser = await User.create({
    username: clean,
    email: cleanEmail,
    passwordHash: await bcrypt.hash(String(password), 12),
  });

  await createSession(String(newUser._id));
  return NextResponse.json({ ok: true });
}
