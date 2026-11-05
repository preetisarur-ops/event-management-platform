import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  let stats = {
    registrations: 0,
    confirmed: 0,
    checkedIn: 0,
    speakers: 0,
    sponsors: 0,
  };

  try {
    const event = await prisma.event.findFirst({ where: { isPublished: true } });
    if (event) {
      const [registrations, confirmed, checkedIn, speakers, sponsors] = await Promise.all([
        prisma.registration.count({ where: { eventId: event.id } }),
        prisma.registration.count({ where: { eventId: event.id, status: "CONFIRMED" } }),
        prisma.ticket.count({ where: { isCheckedIn: true, registration: { eventId: event.id } } }),
        prisma.speaker.count({ where: { eventId: event.id, isActive: true } }),
        prisma.sponsor.count({ where: { eventId: event.id, isActive: true } }),
      ]);
      stats = { registrations, confirmed, checkedIn, speakers, sponsors };
    }
  } catch {
    // DB may not be ready
  }

  const cards = [
    { label: "Total Registrations", value: stats.registrations, color: "bg-primary" },
    { label: "Confirmed", value: stats.confirmed, color: "bg-green-700" },
    { label: "Checked In", value: stats.checkedIn, color: "bg-amber-600" },
    { label: "Speakers", value: stats.speakers, color: "bg-blue-700" },
    { label: "Sponsors", value: stats.sponsors, color: "bg-purple-700" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Event Admin Dashboard</h1>
        <div className="flex items-center gap-4 text-sm">
          <span>{session.user?.email}</span>
          <Link href="/" className="underline opacity-80 hover:opacity-100">
            View Site
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-foreground mb-6">Overview</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {cards.map((c) => (
            <div key={c.label} className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <div className={`w-3 h-3 rounded-full ${c.color} mb-3`} />
              <div className="text-3xl font-bold text-foreground">{c.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <Link href="/register" className="p-3 rounded-lg bg-muted hover:bg-muted/80">
              Public Registration Form
            </Link>
            <Link href="/setup" className="p-3 rounded-lg bg-muted hover:bg-muted/80">
              Setup Status
            </Link>
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-lg bg-muted hover:bg-muted/80"
            >
              Vercel Dashboard
            </a>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Full CRUD modules for Speakers, Sponsors, Registrations, SPOCs, Email Campaigns and
            more can be extended from this foundation. All data is already stored in the database
            via Prisma.
          </p>
        </div>
      </main>
    </div>
  );
}
