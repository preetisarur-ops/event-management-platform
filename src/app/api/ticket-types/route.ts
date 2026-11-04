import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const event = await prisma.event.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });

    if (!event) {
      return NextResponse.json([]);
    }

    const types = await prisma.ticketType.findMany({
      where: { eventId: event.id, isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        benefits: true,
        currency: true,
      },
    });

    return NextResponse.json(
      types.map((t) => ({
        ...t,
        price: Number(t.price),
      }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}
