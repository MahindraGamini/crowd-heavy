"use client";

import type { Court } from "./useLiveCourt";

type RealtimeEvent =
  | { name: "court:update"; data: Court }
  | { name: "note:update"; data: { courtId: string; note: { _id: string; username: string; food: string; note: string; createdAt: string } } };

type RealtimeListener = (event: RealtimeEvent) => void;

const listeners = new Set<RealtimeListener>();
let eventSource: EventSource | undefined;

function handleMessage(message: MessageEvent<string>) {
  let event: RealtimeEvent;
  try {
    event = JSON.parse(message.data) as RealtimeEvent;
  } catch (error) {
    console.error("Failed to process realtime event.", error);
    return;
  }
  for (const listener of listeners) listener(event);
}

export function subscribeToRealtimeEvents(listener: RealtimeListener) {
  listeners.add(listener);
  if (!eventSource) {
    eventSource = new EventSource("/api/events");
    eventSource.addEventListener("update", handleMessage as EventListener);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && eventSource) {
      eventSource.close();
      eventSource = undefined;
    }
  };
}
