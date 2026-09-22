import { NextResponse } from "next/server";
import { saveEventToDb, getRecentEventsFromDb } from "@/lib/db";
import { CountdownEvent } from "@/types/countdown";

export async function GET() {
  const hasDb = !!process.env.DATABASE_URL;
  if (!hasDb) {
    return NextResponse.json({ hasDb: false, events: [] });
  }

  try {
    const events = await getRecentEventsFromDb();
    return NextResponse.json({ hasDb: true, events });
  } catch (error) {
    console.error("API GET /api/events error:", error);
    return NextResponse.json({ hasDb: false, events: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body: CountdownEvent = await req.json();
    if (!body.title || !body.targetDate) {
      return NextResponse.json(
        { error: "Missing required fields: title and targetDate" },
        { status: 400 }
      );
    }

    const saved = await saveEventToDb(body);
    return NextResponse.json({
      success: saved,
      event: body,
      persistedInDb: saved,
    });
  } catch (error) {
    console.error("API POST /api/events error:", error);
    return NextResponse.json(
      { error: "Failed to save event to database" },
      { status: 500 }
    );
  }
}
