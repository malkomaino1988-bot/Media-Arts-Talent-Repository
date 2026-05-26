import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PlanCard from "@/components/PlanCard";
import { useGetMembershipPlans, useCreateUser } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";

const TALENT_TYPES = [
  "Photographer", "Filmmaker", "Videographer", "Musician", "Voice Actor",
  "Graphic Designer", "Actor", "Model", "Producer", "Sound Engineer",
  "Animator", "Writer", "DJ", "Makeup Artist", "Art Director",
  "Editor", "Illustrator", "Set Designer",
];

const STEPS = [
  { id: 1, label: "Plan" },
  { id: 2, label: "Basic Info" },
  { id: 3, label: "Profile" },
  { id: 4, label: "Bio & Talents" },
  { id: 5, label: "Media" },
  { id: 6, label: "Review & Pay" },
];

const PLAN_LIMITS: Record<string, { bio: number | null; talents: number | null; media: number }> = {
  friend: { bio: 150, talents: 3, media: 0 },
  bronze: { bio: 300, talents: 5, media: 3 },
  silver: { bio: 600, talents: 10, media: 10 },
  gold: { bio: null, talents: null, media: 25 },
  "gold-business": { bio: null, talents: null, media: 25 },
  "platinum-business": { bio: null, talents: null, media: 25 },
};

export default function SignUpPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get("plan") ?? "");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    city: "Windsor",
    province: "ON",
    country: "Canada",
    jobTitle: "",
    gender: "",
    age: "",
    bio: "",
    talentTags: [] as string[],
    yearsExperience: "",
    website: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    mediaUrls: [] as string[],
  });

  const { data: plans } = useGetMembershipPlans();
  const createUser = useCreateUser();

  const planLimits = PLAN_LIMITS[selectedPlan] ?? { bio: 600, talents: 10, media: 10 };
  const selectedPlanData = plans?.find((p) => p.slug === selectedPlan);

  const updateForm = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTalent = (talent: string) => {
    const current = form.talentTags;
    if (current.includes(talent)) {
      updateForm("talentTags", current.filter((t) => t !== talent));
    } else if (planLimits.talents === null || current.length < planLimits.talents) {
      updateForm("talentTags", [...current, talent]);
    } else {
      toast({ title: `Your plan allows up to ${planLimits.talents} talent types`, variant: "destructive" });
    }
  };

  const nextStep = () => {
    if (step === 1 && !selectedPlan) {
      toast({ title: "Please select a plan", variant: "destructive" });
      return;
    }
    if (step === 2) {
      if (!form.firstName || !form.lastName || !form.email || !form.password) {
        toast({ title: "Please fill in all required fields", variant: "destructive" });
        return;
      }
    }
    setStep((s) => Math.min(6, s + 1));
  };

  const handlePayPalSuccess = async () => {
    try {
      await createUser.mutateAsync({
        data: {
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || null,
          city: form.city,
          province: form.province,
          country: form.country,
          planName: selectedPlanData?.name,
          bio: form.bio || null,
          jobTitle: form.jobTitle || null,
          talentTags: form.talentTags,
          yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
          gender: form.gender || null,
          age: form.age ? Number(form.age) : null,
          website: form.website || null,
          instagram: form.instagram || null,
          twitter: form.twitter || null,
          linkedin: form.linkedin || null,
          paypalOrderId: `DEMO-${Date.now()}`,
        },
      });
      await signIn(form.email, form.password);
      toast({ title: "Welcome to MATR!", description: "Your profile has been created." });
      setLocation("/dashboard");
    } catch {
      toast({ title: "Registration failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-black text-white py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#E50914] rounded-sm flex items-center justify-center">
                <span className="text-white font-black text-xs">M</span>
              </div>
              <span className="font-black text-white">Join MATR</span>
            </div>
            <Link href="/sign-in">
              <span className="text-white/50 text-sm hover:text-white cursor-pointer transition-colors">
                Already a member? Sign in
              </span>
            </Link>
          </div>

          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                    step > s.id
                      ? "bg-[#E50914] text-white"
                      : step === s.id
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/40"
                  }`}
                >
                  {step > s.id ? <Check size={12} /> : s.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 md:w-14 mx-1 transition-all ${step > s.id ? "bg-[#E50914]" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-white/50 text-sm">
            Step {step} of {STEPS.length}: <span className="text-white font-medium">{STEPS[step - 1].label}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <div>
                <h2 className="text-3xl font-black text-black mb-2">Choose Your Plan</h2>
                <p className="text-gray-500 mb-8">Select the membership that fits your creative journey.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {plans?.filter((p) => !p.isBusinessPlan).map((plan, i) => (
                    <div
                      key={plan.slug}
                      onClick={() => setSelectedPlan(plan.slug)}
                      className={`cursor-pointer rounded-2xl border-2 transition-all ${
                        selectedPlan === plan.slug ? "border-[#E50914] shadow-md" : "border-transparent"
                      }`}
                      data-testid={`select-plan-${plan.slug}`}
                    >
                      <PlanCard {...plan} index={i} onSelect={setSelectedPlan} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-3xl font-black text-black mb-2">Basic Information</h2>
                <p className="text-gray-500 mb-8">Tell us about yourself.</p>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold text-sm">First Name *</Label>
                      <Input
                        value={form.firstName}
                        onChange={(e) => updateForm("firstName", e.target.value)}
                        className="mt-1.5 rounded-xl"
                        placeholder="Jane"
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-sm">Last Name *</Label>
                      <Input
                        value={form.lastName}
                        onChange={(e) => updateForm("lastName", e.target.value)}
                        className="mt-1.5 rounded-xl"
                        placeholder="Doe"
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm">Email *</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      className="mt-1.5 rounded-xl"
                      placeholder="your@email.com"
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-sm">Password *</Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => updateForm("password", e.target.value)}
                      className="mt-1.5 rounded-xl"
                      placeholder="Min. 8 characters"
                      data-testid="input-password"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-sm">Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => updateForm("phone", e.target.value)}
                      className="mt-1.5 rounded-xl"
                      placeholder="+1 (519) 000-0000"
                      data-testid="input-phone"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold text-sm">City</Label>
                      <Input
                        value={form.city}
                        onChange={(e) => updateForm("city", e.target.value)}
                        className="mt-1.5 rounded-xl"
                        data-testid="input-city"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-sm">Province</Label>
                      <Input
                        value={form.province}
                        onChange={(e) => updateForm("province", e.target.value)}
                        className="mt-1.5 rounded-xl"
                        data-testid="input-province"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-3xl font-black text-black mb-2">Profile Details</h2>
                <p className="text-gray-500 mb-8">Help people find and know you better.</p>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                  <div>
                    <Label className="font-semibold text-sm">Professional Title</Label>
                    <Input
                      value={form.jobTitle}
                      onChange={(e) => updateForm("jobTitle", e.target.value)}
                      className="mt-1.5 rounded-xl"
                      placeholder="e.g. Freelance Photographer"
                      data-testid="input-job-title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold text-sm">Gender</Label>
                      <Input
                        value={form.gender}
                        onChange={(e) => updateForm("gender", e.target.value)}
                        className="mt-1.5 rounded-xl"
                        placeholder="Optional"
                        data-testid="input-gender"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-sm">Age</Label>
                      <Input
                        type="number"
                        value={form.age}
                        onChange={(e) => updateForm("age", e.target.value)}
                        className="mt-1.5 rounded-xl"
                        placeholder="Optional"
                        data-testid="input-age"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm">Years of Experience</Label>
                    <Input
                      type="number"
                      value={form.yearsExperience}
                      onChange={(e) => updateForm("yearsExperience", e.target.value)}
                      className="mt-1.5 rounded-xl"
                      placeholder="e.g. 5"
                      data-testid="input-years-experience"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-sm">Website</Label>
                    <Input
                      value={form.website}
                      onChange={(e) => updateForm("website", e.target.value)}
                      className="mt-1.5 rounded-xl"
                      placeholder="https://yourwebsite.com"
                      data-testid="input-website"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="font-semibold text-sm">Instagram</Label>
                      <Input
                        value={form.instagram}
                        onChange={(e) => updateForm("instagram", e.target.value)}
                        className="mt-1.5 rounded-xl"
                        placeholder="@handle"
                        data-testid="input-instagram"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-sm">Twitter</Label>
                      <Input
                        value={form.twitter}
                        onChange={(e) => updateForm("twitter", e.target.value)}
                        className="mt-1.5 rounded-xl"
                        placeholder="@handle"
                        data-testid="input-twitter"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-sm">LinkedIn</Label>
                      <Input
                        value={form.linkedin}
                        onChange={(e) => updateForm("linkedin", e.target.value)}
                        className="mt-1.5 rounded-xl"
                        placeholder="URL"
                        data-testid="input-linkedin"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-3xl font-black text-black mb-2">Bio & Talent Types</h2>
                <p className="text-gray-500 mb-8">Showcase your creative identity.</p>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                  <div>
                    <Label className="font-semibold text-sm">
                      Bio {planLimits.bio ? `(max ${planLimits.bio} characters)` : "(unlimited)"}
                    </Label>
                    <Textarea
                      value={form.bio}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (planLimits.bio === null || val.length <= planLimits.bio) {
                          updateForm("bio", val);
                        }
                      }}
                      className="mt-1.5 rounded-xl min-h-[120px]"
                      placeholder="Tell the world about your creative work..."
                      data-testid="textarea-bio"
                    />
                    {planLimits.bio && (
                      <p className="text-xs text-gray-400 mt-1">
                        {form.bio.length}/{planLimits.bio}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="font-semibold text-sm">
                      Talent Types {planLimits.talents ? `(select up to ${planLimits.talents})` : "(unlimited)"}
                    </Label>
                    <p className="text-xs text-gray-400 mt-0.5 mb-3">
                      {form.talentTags.length} selected
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TALENT_TYPES.map((talent) => (
                        <button
                          key={talent}
                          onClick={() => toggleTalent(talent)}
                          className={`text-sm px-3 py-1.5 rounded-full border transition-all font-medium ${
                            form.talentTags.includes(talent)
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                          }`}
                          data-testid={`tag-select-${talent}`}
                        >
                          {talent}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-3xl font-black text-black mb-2">Media Upload</h2>
                <p className="text-gray-500 mb-8">
                  {planLimits.media === 0
                    ? "Your current plan doesn't include media uploads. Upgrade to add portfolio files."
                    : `Add up to ${planLimits.media} portfolio files to showcase your work.`}
                </p>

                {planLimits.media === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                    <p className="text-gray-400 mb-4">Media uploads not available on Friend plan</p>
                    <Link href={`/sign-up?step=1`}>
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => setStep(1)}
                        data-testid="button-upgrade-plan"
                      >
                        Upgrade Your Plan
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                      <p className="text-gray-400 text-sm">
                        Media upload via URL will be available after registration.
                        You can add up to {planLimits.media} files to your profile.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 6 && (
              <div>
                <h2 className="text-3xl font-black text-black mb-2">Review & Pay</h2>
                <p className="text-gray-500 mb-8">Review your details and complete payment to activate your profile.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-bold text-black mb-4">Order Summary</h3>
                    <div className="border-b border-gray-100 pb-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-black">{selectedPlanData?.name} Plan</span>
                        <span className="font-black text-black">${selectedPlanData?.priceYearly}</span>
                      </div>
                      <span className="text-sm text-gray-400">Annual membership</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span className="text-[#E50914]">${selectedPlanData?.priceYearly}/yr</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="font-bold text-black mb-4">Your Profile</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Name</dt>
                        <dd className="font-medium">{form.firstName} {form.lastName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Email</dt>
                        <dd className="font-medium">{form.email}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Location</dt>
                        <dd className="font-medium">{form.city}, {form.province}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Talents</dt>
                        <dd className="font-medium">{form.talentTags.length} selected</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-bold text-black mb-4">Payment</h3>
                  <p className="text-gray-500 text-sm mb-5">
                    Complete your payment securely with PayPal. You will be redirected to PayPal to finish the transaction.
                  </p>
                  <Button
                    onClick={handlePayPalSuccess}
                    disabled={createUser.isPending}
                    className="w-full h-12 bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold rounded-xl text-base"
                    data-testid="button-paypal-pay"
                  >
                    {createUser.isPending ? "Creating account..." : `Pay $${selectedPlanData?.priceYearly} with PayPal`}
                  </Button>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Sandbox mode — no real payment processed
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="rounded-xl gap-2"
            data-testid="button-prev-step"
          >
            <ChevronLeft size={16} />
            Back
          </Button>
          {step < 6 && (
            <Button
              onClick={nextStep}
              className="bg-[#E50914] hover:bg-[#b40710] text-white font-bold rounded-xl gap-2"
              data-testid="button-next-step"
            >
              Continue
              <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
