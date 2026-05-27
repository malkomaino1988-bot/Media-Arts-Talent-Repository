import { BadgeCheck, FileText, Scale } from "lucide-react";
import { termsHighlights } from "@/lib/trust-content";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <section className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#E50914]">Terms of Use</p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-5xl">
            Product terms designed for a working creative directory, not placeholder copy.
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
            These terms set expectations for profiles, job postings, advertising, moderation, and membership-based visibility inside MATR.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_.95fr] lg:px-8 lg:py-14">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-6 md:p-8">
          <h2 className="text-3xl font-black text-black">Core platform rules</h2>
          <div className="mt-6 space-y-4">
            {termsHighlights.map((item) => (
              <div key={item} className="rounded-2xl border border-gray-100 bg-[#F5F5F5] p-4 text-sm leading-7 text-gray-600">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {[
            {
              icon: BadgeCheck,
              title: "Accurate submissions",
              body: "Profiles, jobs, and ads should represent real opportunities, real services, and real contact details.",
            },
            {
              icon: Scale,
              title: "Moderation rights",
              body: "MATR can pause, edit, remove, or decline content when it undermines safety, clarity, or the purpose of the platform.",
            },
            {
              icon: FileText,
              title: "Paid features",
              body: "Memberships and advertising improve visibility and capability, but they do not guarantee outcomes such as bookings, hires, or impressions.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-[2rem] border border-gray-200 bg-white p-6">
              <card.icon size={18} className="text-[#E50914]" />
              <h3 className="mt-4 text-xl font-black text-black">{card.title}</h3>
              <p className="mt-2 text-sm leading-7 text-gray-500">{card.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
