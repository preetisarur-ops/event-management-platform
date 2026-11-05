import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { qrToken: token },
      include: {
        registration: {
          include: {
            event: true,
            ticketType: true,
          },
        },
        checkIns: {
          orderBy: { checkedInAt: "desc" },
          take: 1,
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ valid: false, status: "INVALID", message: "Ticket not found" });
    }

    if (ticket.status === "CANCELLED") {
      return NextResponse.json({
        valid: false,
        status: "CANCELLED",
        message: "This ticket has been cancelled",
      });
    }

    const reg = ticket.registration;

    return NextResponse.json({
      valid: true,
      status: ticket.isCheckedIn ? "USED" : ticket.status,
      ticketNumber: ticket.ticketNumber,
      registrationId: reg.registrationId,
      fullName: reg.fullName,
      email: reg.email,
      ticketType: reg.ticketType?.name || "General",
      eventName: reg.event.name,
      isCheckedIn: ticket.isCheckedIn,
      checkedInAt: ticket.checkedInAt,
      lastCheckIn: ticket.checkIns[0] || null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ valid: false, status: "ERROR", message: "Verification failed" });
  }
}
