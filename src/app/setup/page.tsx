"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "done" | "error">("loading");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    setupSecret: "",
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((data) => {
        if (data.setupComplete) {
          setStatus("done");
          setMessage("Setup already completed. A Super Admin exists.");
        } else {
          setStatus("ready");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Cannot connect to database. Check environment variables.");
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Setup failed");
        setSubmitting(false);
        return;
      }

      setStatus("done");
      setMessage(data.message);
      setTimeout(() => router.push("/admin/login"), 2000);
    } catch {
      setMessage("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border p-8">
        <h1 className="text-2xl font-bold text-primary mb-2">Initial Setup</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Create the first Super Administrator account. This page works only once.
        </p>

        {status === "loading" && <p className="text-muted-foreground">Checking status\u2026</p>}

        {status === "done" && (
          <div className="p-4 bg-secondary/20 rounded-lg text-foreground">
            {message}
            <p className="mt-2 text-sm">
              <a href="/admin/login" className="text-primary underline">
                Go to Admin Login
              </a>
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{message}</div>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Setup Secret</label>
              <input
                type="password"
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.setupSecret}
                onChange={(e) => setForm({ ...form, setupSecret: e.target.value })}
                placeholder="Value of SETUP_SECRET env var"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password (min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {message && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{message}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Creating\u2026" : "Create Super Admin"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
