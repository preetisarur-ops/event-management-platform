import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { qrToken: token },
    include: {
      registration: {
        include: {
          event: true,
          ticketType: {
            include: {
              spocAssignments: {
                where: { isPrimary: true },
                include: { spoc: true },
              },
            },
          },
        },
      },
    },
  });

  if (!ticket) notFound();

  const reg = ticket.registration;
  const event = reg.event;
  const spoc = reg.ticketType?.spocAssignments[0]?.spoc;

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="bg-primary text-primary-foreground px-6 py-5 text-center">
          <p className="text-sm text-secondary font-medium">Your Ticket</p>
          <h1 className="text-xl font-bold mt-1">{event.name}</h1>
        </div>

        <div className="p-6 space-y-5">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{reg.fullName}</p>
            <p className="text-sm text-muted-foreground mt-1">{reg.email}</p>
          </div>

          {ticket.qrCodeDataUrl && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ticket.qrCodeDataUrl}
                alt="QR Code"
                className="w-48 h-48 border-4 border-primary rounded-xl"
              />
            </div>
          )}

          <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registration ID</span>
              <span className="font-medium">{reg.registrationId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticket Number</span>
              <span className="font-medium">{ticket.ticketNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticket Type</span>
              <span className="font-medium">{reg.ticketType?.name || "General"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span
                className={`font-medium ${
                  ticket.isCheckedIn ? "text-amber-600" : "text-green-700"
                }`}
              >
                {ticket.isCheckedIn ? "Checked In" : "Valid"}
              </span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Date:</strong>{" "}
              {event.startDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              \u2013{" "}
              {event.endDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p>
              <strong>Venue:</strong> {event.venueName}
            </p>
          </div>

          {spoc && (
            <div className="border border-secondary/40 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-primary font-medium mb-2">
                Your Point of Contact
              </p>
              <p className="font-semibold">{spoc.name}</p>
              {spoc.designation && (
                <p className="text-sm text-muted-foreground">{spoc.designation}</p>
              )}
              {spoc.email && (
                <p className="text-sm mt-1">
                  <a href={`mailto:${spoc.email}`} className="text-primary hover:underline">
                    {spoc.email}
                  </a>
                </p>
              )}
              {spoc.phone && (
                <p className="text-sm">
                  <a href={`tel:${spoc.phone}`} className="text-primary hover:underline">
                    {spoc.phone}
                  </a>
                </p>
              )}
            </div>
          )}

          <div className="text-center pt-2">
            <Link href="/" className="text-sm text-primary hover:underline">
              \u2190 Back to event website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
