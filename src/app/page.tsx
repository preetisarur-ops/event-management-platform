import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Countdown from "@/components/Countdown";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

async function getEvent() {
  try {
    const event = await prisma.event.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: {
        speakers: {
          where: { isFeatured: true, isActive: true },
          take: 6,
          orderBy: { sortOrder: "asc" },
        },
        ticketTypes: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    return event;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const event = await getEvent();

  const name = event?.name || "GREEN FUTURE 2027";
  const tagline =
    event?.tagline ||
    "Profit with Purpose. Progress with Responsibility. A Greener Future for Everyone.";
  const description =
    event?.description ||
    "Join GREEN FUTURE 2027, a two-day summit exploring ESG, climate action, social impact and green business innovation. Connect with industry leaders, entrepreneurs and sustainability experts to share ideas and build a greener, more responsible future.";
  const startDate = event?.startDate || new Date("2027-07-05T09:00:00");
  const speakers = event?.speakers || [];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader eventName={name} />

      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <p className="text-secondary font-medium tracking-widest uppercase text-sm mb-4">
            5\u20136 July 2027 \u00b7 Bengaluru
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
            {name}
          </h1>
          <p className="text-lg md:text-xl text-secondary/90 max-w-3xl mx-auto mb-10 text-balance">
            {tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/90 transition-colors shadow-lg"
            >
              Register Now
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white/40 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Learn More
            </Link>
          </div>
          <Countdown targetDate={startDate} />
        </div>
      </section>

      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">About the Summit</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">{description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {[
              { label: "Days", value: "2" },
              { label: "Venue", value: "BIEC" },
              { label: "Focus", value: "ESG & Green Biz" },
              { label: "City", value: "Bengaluru" },
            ].map((item) => (
              <div key={item.label} className="bg-card rounded-xl p-5 shadow-sm border border-border">
                <div className="text-2xl font-bold text-primary">{item.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {speakers.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              Featured Speakers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {speakers.map((speaker) => (
                <div
                  key={speaker.id}
                  className="bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3] bg-primary/10 flex items-center justify-center">
                    {speaker.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={speaker.photoUrl} alt={speaker.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                        {speaker.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-foreground">{speaker.name}</h3>
                    <p className="text-sm text-primary mt-1">
                      {speaker.designation}
                      {speaker.company ? ` \u00b7 ${speaker.company}` : ""}
                    </p>
                    {speaker.bio && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{speaker.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/speakers" className="text-primary font-medium hover:underline">
                View all speakers \u2192
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Us?</h2>
          <p className="text-secondary/90 mb-8">
            Secure your spot at GREEN FUTURE 2027 and be part of the conversation shaping a sustainable future.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Register Now
          </Link>
        </div>
      </section>

      <PublicFooter
        eventName={name}
        organizerName={event?.organizerName || "Preeti S"}
        organizerEmail={event?.organizerEmail || "Preetisarur5@gmail.com"}
        organizerPhone={event?.organizerPhone || "7204886537"}
      />
    </div>
  );
}
