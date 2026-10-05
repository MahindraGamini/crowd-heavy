// app/dashboard/page.tsx
"use client";
import { useLiveCourt } from "../lib/useLiveCourt";

const LEVELS = ["Quiet", "Busy", "Packed", "Closed"] as const;

export default function Dashboard() {
  const courts = useLiveCourt();

  async function report(id: string, crowd: string) {
    const res = await fetch(`/api/foodcourt/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crowd }),
    });
    if (!res.ok) alert((await res.json()).error);
  }

  return (
    <main className="mx-auto max-w-2xl space-y-3 p-6">
      {courts.map((c) => (
        <div key={c._id} className="terminal-box p-4">
          <div className="flex justify-between">
            <p className="font-semibold">{c.name}</p>
            <p className="text-[var(--term-green)]">{c.crowd}</p>
          </div>
          <p className="text-xs text-[var(--term-muted)]">{c.vendors.join(", ")}</p>
          <div className="mt-3 flex gap-2">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => report(c._id, l)}
                className="terminal-input rounded px-2 py-1 text-xs">{l}</button>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}