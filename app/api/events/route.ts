import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import { getSession } from "../../lib/session";
import { RealtimeEvent } from "../../models/RealtimeEvent";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const STREAM_DURATION_MS = 25_000;
const POLL_INTERVAL_MS = 5_000
const HEARTBEAT_INTERVAL_MS = 10_000;

export async function GET(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();

  const lastEventId = request.headers.get("last-event-id");
  let cursor = lastEventId && /^[a-f\d]{24}$/i.test(lastEventId)
    ? new Types.ObjectId(lastEventId)
    : new Types.ObjectId();

  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (value: string) => {
        if (!cancelled) controller.enqueue(encoder.encode(value));
      };
      const close = () => {
        if (!cancelled) {
          cancelled = true;
          controller.close();
        }
      };
      request.signal.addEventListener("abort", () => { cancelled = true; }, { once: true });

      const pump = async () => {
        const deadline = Date.now() + STREAM_DURATION_MS;
        let lastHeartbeat = Date.now();
        send("retry: 1000\n\n");

        try {
          while (!cancelled && !request.signal.aborted && Date.now() < deadline) {
            const events = await RealtimeEvent.find({ _id: { $gt: cursor } })
              .sort({ _id: 1 })
              .limit(100)
              .lean();

            for (const event of events) {
              cursor = event._id;
              send(`id: ${event._id.toString()}\nevent: update\ndata: ${JSON.stringify({ name: event.name, data: event.data })}\n\n`);
            }

            if (Date.now() - lastHeartbeat >= HEARTBEAT_INTERVAL_MS) {
              send(": keep-alive\n\n");
              lastHeartbeat = Date.now();
            }
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
          }
        } catch (error) {
          console.error("SSE event stream failed.", error);
        } finally {
          if (!request.signal.aborted) close();
        }
      };

      void pump();
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
