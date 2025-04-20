// File: app/api/auth/clerk-bridge/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { createClerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Create a Clerk client
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Create a session with Clerk using the Firebase user ID
    const session = await clerk.sessions.getSession(userId);

    if (!session) {
      return NextResponse.json(
        { error: "Failed to retrieve session for the user" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      token: session.lastActiveAt,
    });
  } catch (error: any) {
    console.error("Clerk Bridge Error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication bridge failed" },
      { status: 500 }
    );
  }
}
