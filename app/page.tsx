"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Court = {
  name: string;
  place: string;
  crowd: "Quiet" | "Busy" | "Packed" | "Closed";
  note: string;
  ago: string;
};

const COURTS: Court[] = [
  { name: "Main canteen", place: "Block A", crowd: "Quiet", note: "Dosa counter just opened", ago: "2 min ago" },
  { name: "Library cafe", place: "Library, ground floor", crowd: "Busy", note: "Filter coffee queue ~5 min", ago: "6 min ago" },
  { name: "Hostel mess", place: "Boys hostel", crowd: "Packed", note: "Biryani sold out", ago: "11 min ago" },
  { name: "Juice corner", place: "Near the gate", crowd: "Closed", note: "Back at 4 pm", ago: "40 min ago" },
];

const TONE: Record<Court["crowd"], string> = {
  Quiet: "var(--term-green)",
  Busy: "var(--term-amber)",
  Packed: "var(--term-rose)",
  Closed: "var(--term-muted)",
};

export default function Home() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!/^[a-z0-9_]{3,30}$/i.test(username.trim())) return setError("Username must be 3–30 characters: letters, numbers, or underscores.");
    if (mode === "signup" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)) return setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
    if (mode === "signup" && password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/login" : "/api/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), email: email.trim(), password, confirmPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Authentication failed.");
      }

      if (mode === "signup") {
        setMessage("Account created successfully. Log in to continue to the dashboard.");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-10 md:px-12 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        {/* Left: pitch + live board preview */}
        <section>
          <p className="terminal-text-glow text-sm text-[var(--term-green)]">
            <span aria-hidden>$ </span>campus-eats status
          </p>
          <h1 className="mt-4 max-w-xl text-3xl font-bold leading-tight md:text-5xl">
            Check the food court before you walk there.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--term-muted)] md:text-base">
            Students post how busy each food court is and what&apos;s sold out. Sign in to see
            live updates and add your own.
          </p>

          <ul className="mt-8 space-y-3" aria-label="Example food court statuses">
            {COURTS.map((c, i) => (
              <li
                key={c.name}
                className={`${i === 0 ? "terminal-box-active" : "terminal-box"} flex items-start justify-between gap-4 p-4 transition-colors hover:bg-[var(--term-surface-hover)]`}
              >
                <div className="min-w-0">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-[var(--term-muted)]">{c.place}</p>
                  <p className="mt-2 text-sm">{c.note}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="flex items-center justify-end gap-2 text-sm font-semibold" style={{ color: TONE[c.crowd] }}>
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: TONE[c.crowd] }} aria-hidden />
                    {c.crowd}
                  </p>
                  <p className="mt-1 text-xs text-[var(--term-muted)]">{c.ago}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Right: auth card */}
        <section className="lg:pt-24">
          <div className="terminal-box p-6 md:p-8">
            <div className="mb-6 flex gap-1 rounded-md border border-[var(--term-border)] p-1" role="tablist">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 rounded px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--term-green)] ${
                    mode === m
                      ? "bg-[var(--term-green-glow)] text-[var(--term-green)]"
                      : "text-[var(--term-muted)] hover:text-[var(--term-fg)]"
                  }`}
                >
                  {m === "login" ? "Log in" : "Create account"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="username" className="mb-1.5 block text-sm text-[var(--term-muted)]">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="terminal-input w-full rounded-md px-3 py-2.5 text-sm"
                />
              </div>

              {mode === "signup" && (
                <div>
                  <label htmlFor="confirmPassword" className="mb-1.5 block text-sm text-[var(--term-muted)]">Confirm password</label>
                  <input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="terminal-input w-full rounded-md px-3 py-2.5 text-sm" />
                </div>
              )}

              {mode === "signup" && (
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm text-[var(--term-muted)]">Email</label>
                  <input id="email" type="email" autoComplete="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="terminal-input w-full rounded-md px-3 py-2.5 text-sm" />
                </div>
              )}

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm text-[var(--term-muted)]">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder="Strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="terminal-input w-full rounded-md px-3 py-2.5 text-sm"
                />
                {mode === "signup" && <p className="mt-1 text-xs text-[var(--term-muted)]">Use 8+ characters with uppercase, lowercase, number, and special character.</p>}
              </div>

              {error && (
                <p role="alert" className="text-sm text-[var(--term-rose)]">
                  {error}
                </p>
              )}
              {message && <p role="status" className="text-sm text-[var(--term-green)]">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[var(--term-green)] px-4 py-2.5 text-sm font-semibold text-[var(--term-bg)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--term-green)] disabled:opacity-50"
              >
                {loading ? "Working..." : mode === "login" ? "Log in" : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-[var(--term-muted)]">
              {mode === "login" ? "New here? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
                className="text-[var(--term-green)] underline underline-offset-4"
              >
                {mode === "login" ? "Create an account" : "Log in"}
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
