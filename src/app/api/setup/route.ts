import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const setupSchema = z.object({
  setupSecret: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = setupSchema.parse(body);

    const expectedSecret = process.env.SETUP_SECRET;
    if (!expectedSecret || data.setupSecret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid setup secret" }, { status: 403 });
    }

    const existingSuper = await prisma.userRole.findFirst({
      where: { role: { name: "SUPER_ADMIN" } },
    });

    if (existingSuper) {
      return NextResponse.json(
        { error: "Setup already completed. A Super Admin already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const superAdminRole = await prisma.role.findUnique({
      where: { name: "SUPER_ADMIN" },
    });

    if (!superAdminRole) {
      return NextResponse.json(
        { error: "Roles not seeded. Please run database seed first." },
        { status: 500 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        isActive: true,
        roles: {
          create: {
            roleId: superAdminRole.id,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Super Admin created successfully. You can now log in at /admin/login",
      userId: user.id,
    });
  } catch (error: any) {
    console.error("Setup error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Setup failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const hasSuperAdmin = await prisma.userRole.findFirst({
      where: { role: { name: "SUPER_ADMIN" } },
    });
    const eventCount = await prisma.event.count();
    return NextResponse.json({
      setupComplete: !!hasSuperAdmin,
      hasEvent: eventCount > 0,
    });
  } catch {
    return NextResponse.json({ setupComplete: false, hasEvent: false, dbError: true });
  }
}
