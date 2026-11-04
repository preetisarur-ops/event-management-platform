import Link from "next/link";

export default function PublicFooter({
  eventName,
  organizerName,
  organizerEmail,
  organizerPhone,
}: {
  eventName: string;
  organizerName?: string;
  organizerEmail?: string;
  organizerPhone?: string;
}) {
  return (
    <footer className="bg-[#103B2B] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-semibold text-lg mb-3">{eventName}</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Social Impact, Sustainability & Green Business Summit. Building a greener future
              together.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-secondary">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/agenda" className="hover:text-white">
                  Agenda
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-secondary">Contact</h4>
            <ul className="space-y-2 text-sm text-white/80">
              {organizerName && <li>{organizerName}</li>}
              {organizerEmail && (
                <li>
                  <a href={`mailto:${organizerEmail}`} className="hover:text-white">
                    {organizerEmail}
                  </a>
                </li>
              )}
              {organizerPhone && (
                <li>
                  <a href={`tel:${organizerPhone}`} className="hover:text-white">
                    {organizerPhone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center text-sm text-white/50">
          © {new Date().getFullYear()} {eventName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
