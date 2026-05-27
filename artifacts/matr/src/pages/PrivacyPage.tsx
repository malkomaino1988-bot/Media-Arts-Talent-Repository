import { LockKeyhole, Shield, Eye } from "lucide-react";
import { privacyHighlights } from "@/lib/trust-content";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <section className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#E50914]">Privacy Policy</p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-5xl">
            Clear privacy terms for a directory built around public creative work.
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
            MATR is a public-facing talent and hiring platform. This page explains what information is collected, what becomes public, and how operational data is used to keep the product working.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-14">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-6 md:p-8">
          <h2 className="text-3xl font-black text-black">How MATR handles data</h2>
          <div className="mt-6 space-y-4">
            {privacyHighlights.map((item) => (
              <div key={item} className="rounded-2xl border border-gray-100 bg-[#F5F5F5] p-4 text-sm leading-7 text-gray-600">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {[
            {
              icon: Eye,
              title: "Public profile visibility",
              body: "Profile text, job titles, tags, media links, and other public directory fields are intended to be visible to visitors and potential collaborators.",
            },
            {
              icon: LockKeyhole,
              title: "Support and operations",
              body: "Support submissions and operational logs are used to answer questions, investigate issues, and moderate the platform responsibly.",
            },
            {
              icon: Shield,
              title: "Platform moderation",
              body: "Administrative actions may be reviewed internally to protect members and keep the directory accurate and useful.",
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
