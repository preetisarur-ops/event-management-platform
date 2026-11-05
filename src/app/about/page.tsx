import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { prisma } from "@/lib/prisma";

async function getEvent() {
  try {
    return await prisma.event.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const event = await getEvent();
  const name = event?.name || "GREEN FUTURE 2027";

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader eventName={name} />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">About the Event</h1>
            <p className="text-secondary text-lg">
              {event?.tagline ||
                "Profit with Purpose. Progress with Responsibility. A Greener Future for Everyone."}
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 prose prose-lg">
            <p className="text-lg leading-relaxed text-foreground">
              {event?.description ||
                "Join GREEN FUTURE 2027, a two-day summit exploring ESG, climate action, social impact and green business innovation. Connect with industry leaders, entrepreneurs and sustainability experts to share ideas and build a greener, more responsible future."}
            </p>

            <h2 className="text-2xl font-bold text-primary mt-12 mb-4">Our Theme</h2>
            <p className="text-muted-foreground leading-relaxed">
              {event?.theme ||
                "The event focuses on how businesses, individuals and communities can work together to protect the environment and create a better future. It encourages businesses to earn profits while also taking responsibility for society and nature."}
            </p>

            <h2 className="text-2xl font-bold text-primary mt-12 mb-4">Key Focus Areas</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>ESG (Environmental, Social & Governance) strategies</li>
              <li>Climate action and net-zero pathways</li>
              <li>Social impact and inclusive growth</li>
              <li>Green business models and circular economy</li>
              <li>Sustainable innovation and climate tech</li>
              <li>Policy, finance and collaboration for a greener future</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary mt-12 mb-4">Who Should Attend</h2>
            <p className="text-muted-foreground leading-relaxed">
              Business leaders, entrepreneurs, sustainability professionals, policymakers,
              investors, researchers, students and anyone passionate about building a
              responsible and sustainable future.
            </p>
          </div>
        </section>
      </main>
      <PublicFooter
        eventName={name}
        organizerName={event?.organizerName || "Preeti S"}
        organizerEmail={event?.organizerEmail || "Preetisarur5@gmail.com"}
        organizerPhone={event?.organizerPhone || "7204886537"}
      />
    </div>
  );
}
