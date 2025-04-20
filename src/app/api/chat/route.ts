import { NextResponse } from "next/server";

const FLASK_API_URL = "http://127.0.0.1:5000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await fetch(`${FLASK_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch response from the server" },
      { status: 500 }
    );
  }
}
