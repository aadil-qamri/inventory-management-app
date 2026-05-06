import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // 1. Validation
    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // 2. Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // 3. HASH THE PASSWORD (The Magic Step)
    // The "12" is the 'salt rounds'—the higher the number, the more secure (but slower).
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Save to MongoDB
    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword, // Store the scrambled version!
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "User registered!" }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}