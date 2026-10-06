// app/dashboard/page.tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveCourt } from "../lib/useLiveCourt";
import { subscribeToRealtimeEvents } from "../lib/realtime-client";

const LEVELS = ["Quiet", "Busy", "Packed", "Closed"] as const;

export default function Dashboard() {
  const courts = useLiveCourt();
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, { _id: string; username: string; food: string; note: string; createdAt: string }[]>>({});
  const [drafts, setDrafts] = useState<Record<string, { food: string; note: string }>>({});
  const refreshNotesRef = useRef<() => Promise<void>>(async () => {});

  const refreshNotes = useCallback(async () => {
    const entries = await Promise.all(courts.map(async (court) => [court._id, await fetch(`/api/foodcourt/${court._id}/notes`).then((r) => r.json())] as const));
    setNotes(Object.fromEntries(entries));
  }, [courts]);

  useEffect(() => {
    refreshNotesRef.current = refreshNotes;
  }, [refreshNotes]);

  useEffect(() => {
    fetch("/api/session").then((response) => {
      if (!response.ok) router.replace("/");
    });
  }, [router]);

  useEffect(() => {
    if (courts.length) void refreshNotesRef.current();
  }, [courts.length]);

  useEffect(() => subscribeToRealtimeEvents((event) => {
    if (event.name === "note:update") {
      const { courtId, note } = event.data;
      setNotes((current) => ({ ...current, [courtId]: [note, ...(current[courtId] ?? [])] }));
    }
  }), []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const refreshAtMidnight = () => {
      const nextRefresh = new Date();
      nextRefresh.setDate(nextRefresh.getDate() + 1);
      nextRefresh.setHours(0, 0, 0, 50);
      timeout = setTimeout(() => {
        void refreshNotesRef.current();
        refreshAtMidnight();
      }, nextRefresh.getTime() - Date.now());
    };
    refreshAtMidnight();
    return () => clearTimeout(timeout);
  }, []);

  async function report(id: string, crowd: string) {
    const res = await fetch(`/api/foodcourt/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crowd }),
    });
    if (!res.ok) alert((await res.json()).error);
  }

  async function submitNote(id: string) {
    const draft = drafts[id] ?? { food: "Good", note: "" };
    const res = await fetch(`/api/foodcourt/${id}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    if (!res.ok) return alert((await res.json()).error);
    setDrafts((current) => ({ ...current, [id]: { ...draft, note: "" } }));
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
          <div className="mt-4 border-t border-[var(--term-border)] pt-3">
            <p className="mb-2 text-xs text-[var(--term-muted)]">Daily food review</p>
            <div className="flex gap-2">
              <select className="terminal-input rounded px-2 py-1 text-xs" value={drafts[c._id]?.food ?? "Good"} onChange={(e) => setDrafts((d) => ({ ...d, [c._id]: { food: e.target.value, note: d[c._id]?.note ?? "" } }))}>
                <option>Good</option><option>Average</option><option>Bad</option>
              </select>
              <input className="terminal-input min-w-0 flex-1 rounded px-2 py-1 text-xs" maxLength={140} placeholder="Leave a note..." value={drafts[c._id]?.note ?? ""} onChange={(e) => setDrafts((d) => ({ ...d, [c._id]: { food: d[c._id]?.food ?? "Good", note: e.target.value } }))} />
              <button className="terminal-input rounded px-2 py-1 text-xs" onClick={() => submitNote(c._id)}>Send</button>
            </div>
            <div className="mt-2 space-y-1">{(notes[c._id] ?? []).map((review) => <p key={review._id} className="text-xs"><span className="text-[var(--term-green)]">@{review.username}</span> · <span className="text-[var(--term-amber)]">{review.food}</span> · {review.note}</p>)}</div>
          </div>
        </div>
      ))}
    </main>
  );
}
