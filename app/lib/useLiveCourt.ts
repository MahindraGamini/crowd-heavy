// lib/useLiveCourt.ts
"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export type Court = {
  _id: string; name: string; vendors: string[];
  crowd: "Quiet" | "Busy" | "Packed" | "Closed";
  note: string; updatedAt: string;
};

export function useLiveCourt() {
  const [courts, setCourts] = useState<Court[]>([]);

  useEffect(() => {
    
    fetch("/api/foodcourt").then((r) => r.json()).then(setCourts);

    
    const socket = io();
    socket.on("court:update", (updated: Court) =>
      setCourts((prev) => prev.map((c) => (c._id === updated._id ? updated : c)))
    );

    return () => { socket.disconnect(); };
  }, []);

  return courts;
}