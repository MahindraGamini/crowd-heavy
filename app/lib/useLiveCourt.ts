// lib/useLiveCourt.ts
"use client";
import { useEffect, useState } from "react";
import { subscribeToRealtimeEvents } from "./realtime-client";

export type Court = {
  _id: string; name: string; vendors: string[];
  crowd: "Quiet" | "Busy" | "Packed" | "Closed";
  note: string; updatedAt: string;
};

export function useLiveCourt() {
  const [courts, setCourts] = useState<Court[]>([]);

  useEffect(() => {
    fetch("/api/foodcourt").then((r) => r.json()).then(setCourts);

    return subscribeToRealtimeEvents((event) => {
      if (event.name === "court:update") {
        setCourts((prev) => prev.map((court) => court._id === event.data._id ? event.data : court));
      }
    });
  }, []);

  return courts;
}