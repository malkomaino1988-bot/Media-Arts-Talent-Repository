import { useEffect, useState } from "react";
import { Headphones, LifeBuoy, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trustFaqs } from "@/lib/trust-content";

type SupportMeta = {
  email: string;
  officeHours: string;
  responsePromise: string;
  topics: Array<{ value: string; label: string; responseWindow: string }>;
};

export default function SupportPage() {
  const [meta, setMeta] = useState<SupportMeta | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    topic: "",
    message: "",
  });

  useEffect(() => {
    void fetch("/api/support/meta")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load support information.");
        }

        return response.json() as Promise<SupportMeta>;
      })
      .then((data) => {
        setMeta(data);
        setForm((current) => ({
          ...current,
          topic: current.topic || data.topics[0]?.value || "",
        }));
      })
      .catch(() => {
        setError("Support details are temporarily unavailable. You can still use the form below.");
      });
  }, []);

  const submit = async () => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json() as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to submit your request.");
      }

      setResult(payload.message ?? "Your request has been received.");
      setForm((current) => ({ ...current, organization: "", message: "" }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit your request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:py-20">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#E50914]">Support</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-5xl">
              Real product support for members, employers, and advertisers.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
              Get help with profiles, memberships, job postings, advertising, and account access without guessing where to go next.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { icon: Headphones, label: "Support inbox", value: meta?.email ?? "support@matr.local" },
                { icon: ShieldCheck, label: "Response goal", value: meta?.responsePromise ?? "Most requests receive a response within 1 business day." },
                { icon: Mail, label: "Office hours", value: meta?.officeHours ?? "Monday to Friday, 9:00 AM to 5:00 PM Eastern" },
                { icon: LifeBuoy, label: "Coverage", value: "Accounts, billing, profiles, jobs, ads, and technical help" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <item.icon size={18} className="mb-3 text-[#E50914]" />
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:px-8 lg:py-14">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-6 md:p-8">
          <div className="mb-6">
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gray-400">Contact Support</p>
            <h2 className="text-3xl font-black text-black">Send a request</h2>
            <p className="mt-2 text-sm text-gray-500">
              Use this form for account help, membership questions, job posting issues, advertising, or technical problems.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Your name" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
            <Input placeholder="Email address" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
            <Input placeholder="Organization (optional)" value={form.organization} onChange={(e) => setForm((current) => ({ ...current, organization: e.target.value }))} />
            <select
              value={form.topic}
              onChange={(e) => setForm((current) => ({ ...current, topic: e.target.value }))}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm"
            >
              {(meta?.topics ?? []).map((topic) => (
                <option key={topic.value} value={topic.value}>{topic.label}</option>
              ))}
            </select>
          </div>

          <Textarea
            className="mt-4 min-h-40 rounded-2xl"
            placeholder="Tell MATR support what you need help with."
            value={form.message}
            onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))}
          />

          {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {result && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{result}</p>}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button className="rounded-xl bg-[#E50914] text-white hover:bg-[#b40710]" onClick={submit} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Submit Request"}
            </Button>
            <p className="text-xs text-gray-500">Most requests receive a reply within 1 business day.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-gray-200 bg-white p-6 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <MessageSquare size={18} className="text-[#E50914]" />
              <h2 className="text-2xl font-black text-black">Help Center</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {trustFaqs.map((item) => (
                <AccordionItem key={item.question} value={item.question}>
                  <AccordionTrigger className="text-base font-semibold text-black hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-gray-500">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="rounded-[2rem] bg-black p-6 text-white md:p-8">
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-white/40">Trust</p>
            <h3 className="text-2xl font-black">A finished product needs clarity.</h3>
            <p className="mt-3 text-sm leading-7 text-white/65">
              MATR now has direct support entry points, published privacy and terms pages, and a backend-backed help workflow so members are never left guessing how to get help.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
