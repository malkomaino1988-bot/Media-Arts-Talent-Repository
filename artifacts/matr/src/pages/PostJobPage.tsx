import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Briefcase, CheckCircle2, ClipboardList, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateJob } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { buildAuthHref } from "@/lib/auth-routes";

const CATEGORIES = [
  "Photography", "Film & Video", "Music", "Graphic Design", "Voice Acting",
  "Acting & Performance", "Modeling", "Production", "Sound Engineering",
  "Animation", "Writing & Content", "DJ & Events", "Makeup & Beauty",
  "Art Direction", "Editing", "Illustration",
];

const STEPS = [
  { id: "form", label: "Role Details" },
  { id: "pay", label: "Review and Pay" },
] as const;

export default function PostJobPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const createJob = useCreateJob();

  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    category: "",
    city: "Windsor",
    province: "ON",
    compensation: "",
    contactEmail: "",
  });

  const [step, setStep] = useState<"form" | "pay">("form");

  const updateForm = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (!form.title || !form.company || !form.description || !form.category || !form.contactEmail) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setStep("pay");
  };

  const handlePay = async () => {
    if (!user) {
      toast({ title: "Please sign in to post a job", variant: "destructive" });
      setLocation(buildAuthHref("/sign-in", { redirectTo: "/post-job" }));
      return;
    }

    try {
      await createJob.mutateAsync({
        data: {
          ...form,
          userId: user.id,
          paypalOrderId: `JOB-${Date.now()}`,
        },
      });
      toast({ title: "Job posted successfully", description: "Your listing is now live and visible on the job board." });
      setLocation("/dashboard?success=job-posted");
    } catch {
      toast({ title: "Failed to post job", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-black text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="text-[#E50914]" size={28} />
            <h1 className="text-4xl font-black">Post a Job</h1>
          </div>
          <p className="text-white/50 text-lg max-w-2xl">
            Reach the MATR talent community with a role that is structured clearly and ready for applicants to act on.
          </p>
          <div className="grid gap-3 sm:grid-cols-3 mt-8">
            {[
              { icon: Users, value: "Targeted", label: "Creative audience" },
              { icon: MapPin, value: "Local", label: "City-based discovery" },
              { icon: ClipboardList, value: "$100", label: "2 months live" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <item.icon size={16} className="text-[#E50914] mb-3" />
                <p className="text-2xl font-black text-white">{item.value}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/35 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!isLoading && !isAuthenticated ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-gray-500 mb-6">Sign in first to post a job to the directory.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href={buildAuthHref("/sign-in", { redirectTo: "/post-job" })}>
                <Button className="bg-[#E50914] hover:bg-[#b40710] text-white font-semibold rounded-xl">
                  Sign In
                </Button>
              </Link>
              <Link href={buildAuthHref("/sign-up", { redirectTo: "/post-job" })}>
                <Button variant="outline" className="rounded-xl">Create Account</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-3 mb-8">
              {STEPS.map((item, index) => {
                const active = step === item.id;
                const complete = index === 0 && step === "pay";
                return (
                  <div
                    key={item.id}
                    className={active
                      ? "rounded-2xl border border-black bg-black p-4 text-white"
                      : complete
                        ? "rounded-2xl border border-[#E50914]/20 bg-[#E50914]/5 p-4 text-black"
                        : "rounded-2xl border border-gray-200 bg-white p-4 text-gray-500"}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] mb-1">{`Step ${index + 1}`}</p>
                    <p className="font-semibold">{item.label}</p>
                  </div>
                );
              })}
            </div>

            {step === "form" ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-7 space-y-5">
                    <div>
                      <Label className="font-semibold text-sm">Job Title *</Label>
                      <Input
                        value={form.title}
                        onChange={(e) => updateForm("title", e.target.value)}
                        className="mt-1.5 rounded-xl"
                        placeholder="e.g. Freelance Videographer Needed"
                        data-testid="input-job-title"
                      />
                    </div>

                    <div>
                      <Label className="font-semibold text-sm">Company / Organization *</Label>
                      <Input
                        value={form.company}
                        onChange={(e) => updateForm("company", e.target.value)}
                        className="mt-1.5 rounded-xl"
                        placeholder="Your company name"
                        data-testid="input-company"
                      />
                    </div>

                    <div>
                      <Label className="font-semibold text-sm">Category *</Label>
                      <Select value={form.category} onValueChange={(value) => updateForm("category", value)}>
                        <SelectTrigger className="mt-1.5 rounded-xl" data-testid="select-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="font-semibold text-sm">Job Description *</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => updateForm("description", e.target.value)}
                        className="mt-1.5 rounded-xl min-h-[140px]"
                        placeholder="Describe the role, requirements, schedule, and what success looks like."
                        data-testid="textarea-description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold text-sm">City</Label>
                        <Input value={form.city} onChange={(e) => updateForm("city", e.target.value)} className="mt-1.5 rounded-xl" data-testid="input-city" />
                      </div>
                      <div>
                        <Label className="font-semibold text-sm">Province</Label>
                        <Input value={form.province} onChange={(e) => updateForm("province", e.target.value)} className="mt-1.5 rounded-xl" data-testid="input-province" />
                      </div>
                    </div>

                    <div>
                      <Label className="font-semibold text-sm">Compensation (optional)</Label>
                      <Input
                        value={form.compensation}
                        onChange={(e) => updateForm("compensation", e.target.value)}
                        className="mt-1.5 rounded-xl"
                        placeholder="e.g. $500-800, negotiable, or TBD"
                        data-testid="input-compensation"
                      />
                    </div>

                    <div>
                      <Label className="font-semibold text-sm">Contact Email *</Label>
                      <Input
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => updateForm("contactEmail", e.target.value)}
                        className="mt-1.5 rounded-xl"
                        placeholder="hiring@yourcompany.com"
                        data-testid="input-contact-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                        <ClipboardList size={18} className="text-[#E50914]" />
                        Posting Checklist
                      </h3>
                      <div className="space-y-3 text-sm text-gray-600">
                        {[
                          "Name the exact role you are hiring for.",
                          "Describe the schedule, location, and expected responsibilities.",
                          "Include contact information that will be monitored.",
                        ].map((item) => (
                          <div key={item} className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-[#E50914] mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black rounded-2xl p-6 text-white">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45 mb-2">Pricing</p>
                      <p className="text-3xl font-black mb-2">$100</p>
                      <p className="text-sm text-white/65 mb-4">
                        Each posting runs for two months and appears on the public MATR job board after checkout.
                      </p>
                      <p className="text-xs text-white/45">
                        You will return to your dashboard after submission so the posting is easy to track.
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h3 className="font-bold text-black mb-4">What a strong listing includes</h3>
                      <div className="space-y-3 text-sm text-gray-600">
                        {[
                          "A specific title creators immediately recognize.",
                          "Enough detail to understand schedule, expectations, and compensation.",
                          "A contact email that is monitored and ready for replies.",
                        ].map((item) => (
                          <div key={item} className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-[#E50914] mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  className="mt-6 w-full h-12 bg-[#E50914] hover:bg-[#b40710] text-white font-bold rounded-xl text-base"
                  data-testid="button-proceed-to-payment"
                >
                  Proceed to Payment - $100
                </Button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-bold text-black text-lg mb-4">Order Summary</h3>
                    <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Job Posting</span>
                        <span className="font-semibold text-right">{form.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration</span>
                        <span className="font-semibold">2 months</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Company</span>
                        <span className="font-semibold text-right">{form.company}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Location</span>
                        <span className="font-semibold text-right">{form.city}, {form.province}</span>
                      </div>
                    </div>
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span className="text-[#E50914]">$100.00</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-bold text-black text-lg mb-4">Payment</h3>
                    <p className="text-gray-500 text-sm mb-5">
                      Complete payment securely with PayPal. Your job will go live immediately after payment and remain attached to your dashboard.
                    </p>
                    <Button
                      onClick={handlePay}
                      disabled={createJob.isPending}
                      className="w-full h-12 bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold rounded-xl"
                      data-testid="button-paypal-job"
                    >
                      {createJob.isPending ? "Processing..." : "Pay $100 with PayPal"}
                    </Button>
                    <p className="text-xs text-gray-400 text-center mt-3">Sandbox mode</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setStep("form")}
                  className="mt-4 rounded-xl"
                  data-testid="button-back-form"
                >
                  Edit Job Details
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
