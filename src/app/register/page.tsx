"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  benefits: string[];
}

export default function RegisterPage() {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicket, setSelectedTicket] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    designation: "",
    city: "",
    country: "India",
    invitationCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    registrationId?: string;
    ticketUrl?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/ticket-types")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTicketTypes(data);
          if (data.length > 0) setSelectedTicket(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ticketTypeId: selectedTicket || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, error: data.error || "Registration failed" });
      } else {
        setResult({
          success: true,
          registrationId: data.registrationId,
          ticketUrl: data.ticketUrl,
        });
      }
    } catch {
      setResult({ success: false, error: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (result?.success) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader eventName="GREEN FUTURE 2027" />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-lg w-full bg-card rounded-2xl shadow-lg border border-border p-8 text-center">
            <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Registration Successful!</h1>
            <p className="text-muted-foreground mb-6">
              Your registration ID is <strong className="text-primary">{result.registrationId}</strong>.
              A confirmation email with your ticket and QR code has been sent.
            </p>
            {result.ticketUrl && (
              <Link
                href={result.ticketUrl}
                className="inline-flex px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90"
              >
                View Your Ticket
              </Link>
            )}
            <div className="mt-6">
              <Link href="/" className="text-sm text-primary hover:underline">
                \u2190 Back to Home
              </Link>
            </div>
          </div>
        </main>
        <PublicFooter eventName="GREEN FUTURE 2027" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader eventName="GREEN FUTURE 2027" />
      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Register for the Summit</h1>
          <p className="text-muted-foreground mb-8">
            Fill in your details to secure your place at GREEN FUTURE 2027.
          </p>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 space-y-5">
            {ticketTypes.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Ticket Type</label>
                <div className="space-y-2">
                  {ticketTypes.map((tt) => (
                    <label
                      key={tt.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                        selectedTicket === tt.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="ticketType"
                        value={tt.id}
                        checked={selectedTicket === tt.id}
                        onChange={() => setSelectedTicket(tt.id)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{tt.name}</div>
                        {tt.description && (
                          <div className="text-sm text-muted-foreground mt-0.5">{tt.description}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Organization</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Designation</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">City</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Country</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Invitation Code (if any)</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.invitationCode}
                  onChange={(e) => setForm({ ...form, invitationCode: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            {result?.error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{result.error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Submitting\u2026" : "Complete Registration"}
            </button>
          </form>
        </div>
      </main>
      <PublicFooter eventName="GREEN FUTURE 2027" />
    </div>
  );
}
