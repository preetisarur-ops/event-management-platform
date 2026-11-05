import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const roles = [
    { name: "SUPER_ADMIN", description: "Full system access", isSystem: true },
    { name: "EVENT_MANAGER", description: "Manage event content and registrations", isSystem: true },
    { name: "SPEAKER_MANAGER", description: "Manage speakers", isSystem: true },
    { name: "SPONSOR_MANAGER", description: "Manage sponsors", isSystem: true },
    { name: "STALL_MANAGER", description: "Manage stalls and exhibitors", isSystem: true },
    { name: "ARTIST_MANAGER", description: "Manage artists and performers", isSystem: true },
    { name: "REGISTRATION_MANAGER", description: "Manage registrations and check-ins", isSystem: true },
    { name: "CHECKIN_STAFF", description: "QR scan and check-in only", isSystem: true },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  const permissions = [
    "event:read", "event:write",
    "registrations:read", "registrations:write", "registrations:export",
    "tickets:read", "tickets:write", "tickets:checkin",
    "speakers:read", "speakers:write",
    "sponsors:read", "sponsors:write",
    "exhibitors:read", "exhibitors:write",
    "stalls:read", "stalls:write",
    "artists:read", "artists:write",
    "spocs:read", "spocs:write",
    "users:read", "users:write",
    "emails:send", "emails:manage",
    "reminders:manage",
    "reports:view", "reports:export",
    "settings:manage",
    "audit:view",
  ];

  for (const code of permissions) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code, description: code },
    });
  }

  const superAdminRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
  const allPerms = await prisma.permission.findMany();
  if (superAdminRole) {
    for (const perm of allPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id },
        },
        update: {},
        create: { roleId: superAdminRole.id, permissionId: perm.id },
      });
    }
  }

  const existingEvent = await prisma.event.findFirst({
    where: { name: { contains: "GREEN FUTURE 2027" } },
  });

  let event = existingEvent;
  if (!event) {
    event = await prisma.event.create({
      data: {
        name: "GREEN FUTURE 2027 \u2013 Social Impact, Sustainability & Green Business Summit",
        tagline: "Profit with Purpose. Progress with Responsibility. A Greener Future for Everyone.",
        description:
          "Join GREEN FUTURE 2027, a two-day summit exploring ESG, climate action, social impact and green business innovation. Connect with industry leaders, entrepreneurs and sustainability experts to share ideas and build a greener, more responsible future.",
        categoryPrimary: "Business & Entrepreneurship",
        categorySecondary: "Environment & Sustainability",
        categories: [
          "Conferences & Summits",
          "Social Impact & Community",
          "Education & Workshops",
          "Networking",
        ],
        theme:
          "The event focuses on how businesses, individuals and communities can work together to protect the environment and create a better future. It encourages businesses to earn profits while also taking responsibility for society and nature.",
        startDate: new Date("2027-07-05T03:30:00.000Z"),
        endDate: new Date("2027-07-06T12:00:00.000Z"),
        startTime: "09:00",
        endTime: "17:30",
        timezone: "Asia/Kolkata",
        venueName: "Bangalore International Exhibition Centre (BIEC)",
        venueAddress:
          "10th Mile, Tumkur Road, Madavara, Bengaluru, Karnataka \u2013 562162, India.",
        googleMapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Bangalore+International+Exhibition+Centre+BIEC",
        organizerName: "Preeti S",
        organizerEmail: "Preetisarur5@gmail.com",
        organizerPhone: "7204886537",
        isPublished: true,
        socialLinks: {},
      },
    });
  }

  const branding = {
    primaryColor: "#174D36",
    secondaryColor: "#A8C98A",
    backgroundColor: "#F3EBDD",
    textColor: "#103B2B",
    fontFamily: "Poppins",
  };

  for (const [key, value] of Object.entries(branding)) {
    await prisma.eventSetting.upsert({
      where: { eventId_key: { eventId: event.id, key } },
      update: { value },
      create: { eventId: event.id, key, value },
    });
  }

  const ticketTypesData = [
    {
      name: "General Attendee",
      description: "Full access to all sessions, networking and exhibition area.",
      price: 0,
      benefits: ["All keynotes & panels", "Exhibition access", "Networking breaks", "Certificate"],
      sortOrder: 1,
    },
    {
      name: "VIP",
      description: "Premium access with reserved seating and exclusive networking.",
      price: 0,
      benefits: ["Reserved seating", "VIP lounge access", "Exclusive networking dinner", "Priority registration", "Certificate"],
      sortOrder: 2,
    },
    {
      name: "Speaker",
      description: "For confirmed speakers of the summit.",
      price: 0,
      benefits: ["Speaker lounge", "Full event access", "Certificate of appreciation"],
      sortOrder: 3,
    },
    {
      name: "Exhibitor / Stall Owner",
      description: "For organisations exhibiting sustainable products and solutions.",
      price: 0,
      benefits: ["Stall space", "Listing in programme", "Full event access"],
      sortOrder: 4,
    },
  ];

  for (const tt of ticketTypesData) {
    const existing = await prisma.ticketType.findFirst({
      where: { eventId: event.id, name: tt.name },
    });
    if (!existing) {
      await prisma.ticketType.create({
        data: { ...tt, eventId: event.id, currency: "INR", isActive: true },
      });
    }
  }

  const existingSpoc = await prisma.spoc.findFirst({ where: { eventId: event.id } });
  if (!existingSpoc) {
    const spoc = await prisma.spoc.create({
      data: {
        eventId: event.id,
        name: "Preeti S",
        designation: "Event Coordinator",
        department: "Operations",
        email: "Preetisarur5@gmail.com",
        phone: "7204886537",
        whatsapp: "7204886537",
        responsibility: "Overall event coordination and participant support",
      },
    });

    const generalTicket = await prisma.ticketType.findFirst({
      where: { eventId: event.id, name: "General Attendee" },
    });
    if (generalTicket) {
      await prisma.spocAssignment.create({
        data: {
          spocId: spoc.id,
          ticketTypeId: generalTicket.id,
          isPrimary: true,
        },
      });
    }
  }

  const speakersData = [
    {
      name: "Dr. Ananya Sharma",
      designation: "Chief Sustainability Officer",
      company: "GreenTech India",
      bio: "Leading ESG transformation across manufacturing and supply chains for over 15 years.",
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: "Rajesh Menon",
      designation: "Founder & CEO",
      company: "EcoVenture Labs",
      bio: "Serial entrepreneur building climate-tech startups and mentoring green innovators.",
      isFeatured: true,
      sortOrder: 2,
    },
    {
      name: "Priya Nair",
      designation: "Director \u2013 Climate Policy",
      company: "Sustainable Futures Institute",
      bio: "Policy expert advising governments and corporations on net-zero pathways.",
      isFeatured: true,
      sortOrder: 3,
    },
  ];

  for (const s of speakersData) {
    const exists = await prisma.speaker.findFirst({
      where: { eventId: event.id, name: s.name },
    });
    if (!exists) {
      await prisma.speaker.create({ data: { ...s, eventId: event.id, isActive: true } });
    }
  }

  const pages = [
    { slug: "home", title: "Home", sortOrder: 0 },
    { slug: "about", title: "About the Event", sortOrder: 1 },
    { slug: "agenda", title: "Event Agenda", sortOrder: 2 },
    { slug: "speakers", title: "Speakers", sortOrder: 3 },
    { slug: "sponsors", title: "Sponsors", sortOrder: 4 },
    { slug: "venue", title: "Venue & Location", sortOrder: 5 },
    { slug: "register", title: "Registration", sortOrder: 6 },
    { slug: "contact", title: "Contact", sortOrder: 7 },
  ];

  for (const p of pages) {
    await prisma.eventPage.upsert({
      where: { eventId_slug: { eventId: event.id, slug: p.slug } },
      update: {},
      create: { ...p, eventId: event.id, isEnabled: true },
    });
  }

  const formFields = [
    { name: "fullName", label: "Full Name", type: "text", isRequired: true, sortOrder: 1 },
    { name: "email", label: "Email Address", type: "email", isRequired: true, sortOrder: 2 },
    { name: "phone", label: "Mobile Number", type: "phone", isRequired: true, sortOrder: 3 },
    { name: "organization", label: "Organization", type: "text", isRequired: false, sortOrder: 4 },
    { name: "designation", label: "Designation", type: "text", isRequired: false, sortOrder: 5 },
    { name: "city", label: "City", type: "text", isRequired: false, sortOrder: 6 },
  ];

  for (const f of formFields) {
    const exists = await prisma.registrationFormField.findFirst({
      where: { eventId: event.id, name: f.name },
    });
    if (!exists) {
      await prisma.registrationFormField.create({
        data: { ...f, eventId: event.id, isActive: true },
      });
    }
  }

  console.log("Seed completed successfully.");
  console.log("Event ID:", event.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
