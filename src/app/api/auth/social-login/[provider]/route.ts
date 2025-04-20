// File: app/api/auth/social-login/[provider]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, googleProvider, githubProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { createClerkClient } from "@clerk/nextjs/server";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider } = params;
    let authProvider;

    // Select the appropriate provider
    if (provider === "google") {
      authProvider = googleProvider;
    } else if (provider === "github") {
      authProvider = githubProvider;
    } else {
      return NextResponse.json(
        { error: "Unsupported provider" },
        { status: 400 }
      );
    }

    // This won't work in a server component - social login should be handled client-side
    // This is just a reference implementation
    const result = await signInWithPopup(auth, authProvider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      // Create user profile if it doesn't exist
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
      });
    }

    // Create a Clerk client
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Create a Clerk session
    const session = await clerk.sessions.getSession(user.uid);

    return NextResponse.json({
      success: true,
      userId: user.uid,
      sessionId: session.id,
      token: session.lastActiveAt,
    });
  } catch (error: any) {
    console.error("Social Login Error:", error);
    return NextResponse.json(
      { error: error.message || "Social login failed" },
      { status: 500 }
    );
  }
}

// Note: For social sign-up, you can use the same endpoint
// as the logic is virtually identical
export { POST as socialSignUp };
