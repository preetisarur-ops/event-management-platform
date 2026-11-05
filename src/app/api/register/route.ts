import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { generateRegistrationId, generateTicketNumber, generateSecureToken } from "@/lib/utils";
import { generateQRDataUrl, getVerificationUrl } from "@/lib/qr";
import { sendEmail, buildConfirmationEmailHtml } from "@/lib/email";

const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().min(7).max(20).optional(),
  organization: z.string().max(200).optional(),
  designation: z.string().max(120).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  ticketTypeId: z.string().optional(),
  invitationCode: z.string().optional(),
  customAnswers: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const event = await prisma.event.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });

    if (!event) {
      return NextResponse.json({ error: "No active event found" }, { status: 404 });
    }

    const existing = await prisma.registration.findUnique({
      where: {
        eventId_email: {
          eventId: event.id,
          email: data.email.toLowerCase(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already registered for this event with this email." },
        { status: 409 }
      );
    }

    let invitation = null;
    if (data.invitationCode) {
      invitation = await prisma.invitation.findFirst({
        where: {
          eventId: event.id,
          code: data.invitationCode,
          isActive: true,
        },
      });
      if (!invitation) {
        return NextResponse.json({ error: "Invalid invitation code" }, { status: 400 });
      }
      if (invitation.expiresAt && invitation.expiresAt < new Date()) {
        return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
      }
      if (invitation.usedCount >= invitation.maxUses) {
        return NextResponse.json({ error: "Invitation already used" }, { status: 400 });
      }
    }

    let ticketType = null;
    if (data.ticketTypeId) {
      ticketType = await prisma.ticketType.findFirst({
        where: { id: data.ticketTypeId, eventId: event.id, isActive: true },
      });
    } else {
      ticketType = await prisma.ticketType.findFirst({
        where: { eventId: event.id, isActive: true },
        orderBy: { sortOrder: "asc" },
      });
    }

    const registrationId = generateRegistrationId("GF2027");
    const ticketNumber = generateTicketNumber("TKT");
    const qrToken = generateSecureToken(40);

    const result = await prisma.$transaction(async (tx) => {
      const registration = await tx.registration.create({
        data: {
          eventId: event.id,
          ticketTypeId: ticketType?.id,
          registrationId,
          fullName: data.fullName,
          email: data.email.toLowerCase(),
          phone: data.phone,
          organization: data.organization,
          designation: data.designation,
          city: data.city,
          country: data.country || "India",
          status: "CONFIRMED",
          invitationCode: data.invitationCode,
          customAnswers: data.customAnswers || {},
        },
      });

      const qrDataUrl = await generateQRDataUrl(getVerificationUrl(qrToken));

      const ticket = await tx.ticket.create({
        data: {
          registrationId: registration.id,
          ticketNumber,
          qrToken,
          qrCodeDataUrl: qrDataUrl,
          status: "VALID",
        },
      });

      if (invitation) {
        await tx.invitation.update({
          where: { id: invitation.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      if (ticketType) {
        await tx.ticketType.update({
          where: { id: ticketType.id },
          data: { soldCount: { increment: 1 } },
        });
      }

      return { registration, ticket };
    });

    let spoc = null;
    if (ticketType) {
      const assignment = await prisma.spocAssignment.findFirst({
        where: { ticketTypeId: ticketType.id, isPrimary: true },
        include: { spoc: true },
      });
      spoc = assignment?.spoc || null;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const ticketUrl = `${appUrl}/ticket/${result.ticket.qrToken}`;

    const emailHtml = buildConfirmationEmailHtml({
      participantName: data.fullName,
      eventName: event.name,
      eventDate: `${event.startDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })} \u2013 ${event.endDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
      eventVenue: event.venueName || "Venue TBA",
      ticketNumber: result.ticket.ticketNumber,
      registrationId: result.registration.registrationId,
      ticketType: ticketType?.name || "General",
      qrCodeUrl: result.ticket.qrCodeDataUrl || undefined,
      spocName: spoc?.name,
      spocEmail: spoc?.email || undefined,
      spocPhone: spoc?.phone || undefined,
      ticketUrl,
    });

    await sendEmail({
      to: data.email,
      subject: `Registration Confirmed \u2013 ${event.name}`,
      html: emailHtml,
    });

    await prisma.emailLog.create({
      data: {
        toEmail: data.email,
        subject: `Registration Confirmed \u2013 ${event.name}`,
        status: "SENT",
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      registrationId: result.registration.registrationId,
      ticketNumber: result.ticket.ticketNumber,
      ticketUrl,
      qrToken: result.ticket.qrToken,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
