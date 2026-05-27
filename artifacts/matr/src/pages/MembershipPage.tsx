import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Crown, Megaphone, Users } from "lucide-react";
import PlanCard from "@/components/PlanCard";
import { useGetMembershipPlans, useSubscribeMembership } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { buildAuthHref } from "@/lib/auth-routes";

const HERO_IMAGE = `${import.meta.env.BASE_URL}opengraph.jpg`;

const PLAN_OUTCOMES = [
  {
    icon: Users,
    title: "Directory visibility",
    text: "Appear in the searchable directory with richer tags, profile details, and stronger first impressions.",
  },
  {
    icon: Crown,
    title: "Profile strength",
    text: "Upgrade your public profile so hiring teams can understand your work faster and trust what they are seeing.",
  },
  {
    icon: Megaphone,
    title: "Business reach",
    text: "Use business plans when you need hiring support, promotion tools, and stronger market presence in one account.",
  },
];

export default function MembershipPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const selectedPlanSlug = searchParams.get("plan") ?? "";
  const [planToggle, setPlanToggle] = useState<"individual" | "business">(
    selectedPlanSlug.includes("business") ? "business" : "individual",
  );
  const { data: plans, isLoading } = useGetMembershipPlans();
  const subscribeMembership = useSubscribeMembership();

  const individualPlans = plans?.filter((p) => !p.isBusinessPlan) ?? [];
  const businessPlans = plans?.filter((p) => p.isBusinessPlan) ?? [];
  const displayPlans = planToggle === "individual" ? individualPlans : businessPlans;
  const selectedPlan = plans?.find((plan) => plan.slug === selectedPlanSlug) ?? null;

  useEffect(() => {
    if (selectedPlanSlug) {
      setPlanToggle(selectedPlanSlug.includes("business") ? "business" : "individual");
    }
  }, [selectedPlanSlug]);

  const handleSelectPlan = async (slug: string) => {
    if (!user || !isAuthenticated) {
      setLocation(buildAuthHref("/sign-up", { plan: slug, redirectTo: `/membership?plan=${slug}` }));
      return;
    }

    const plan = plans?.find((entry) => entry.slug === slug);
    if (!plan) {
      toast({ title: "Plan not found", variant: "destructive" });
      return;
    }

    if (user.planName === plan.name) {
      toast({ title: `You already have the ${plan.name} plan.` });
      setLocation("/dashboard");
      return;
    }

    try {
      await subscribeMembership.mutateAsync({
        data: {
          userId: user.id,
          planSlug: slug,
          paypalOrderId: `SUB-${Date.now()}`,
        },
      });
      toast({ title: "Membership activated", description: `${plan.name} is now attached to your account.` });
      setLocation(`/dashboard?success=membership-${encodeURIComponent(slug)}`);
    } catch {
      toast({ title: "Failed to activate membership", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_.95fr] gap-10 items-center">
            <div className="max-w-2xl">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs uppercase tracking-[0.22em] text-[#E50914] mb-3"
              >
                Membership Plans
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-black mb-4"
              >
                Join our creative talent directory.
              </motion.h1>
              <p className="text-white/60 text-lg max-w-xl">
                Individual plans range from $25/year to $250/yr, with business options available when you need hiring and branding tools in the same workflow.
              </p>
            </div>

            <div className="relative h-[280px] md:h-[340px] overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900">
              <img
                src={HERO_IMAGE}
                alt="Creative membership preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/45 to-transparent" />
              <div className="absolute left-0 top-0 flex h-full max-w-[65%] flex-col justify-end p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E50914]">
                  Built to convert
                </p>
                <p className="mt-3 text-3xl font-black text-white leading-tight">
                  Pick the plan that matches how visible and active you need to be.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {selectedPlan && (
          <div className="mb-8 rounded-[1.8rem] border border-[#E50914]/15 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-[#E50914] mb-2">Selected Plan</p>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-black">{selectedPlan.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isAuthenticated
                    ? "Continue below to activate this plan on your account."
                    : "Create your account first, then you will return here ready to continue with this plan."}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-[#E50914]">${selectedPlan.priceYearly}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">per year</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[.88fr_1.12fr] mb-10">
          {PLAN_OUTCOMES.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-[1.8rem] border border-gray-200 bg-white p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white mb-4">
                <item.icon size={18} />
              </div>
              <h2 className="text-2xl font-black text-black mb-3">{item.title}</h2>
              <p className="text-gray-500 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white rounded-xl p-1.5 border border-gray-200 shadow-sm">
            <button
              onClick={() => setPlanToggle("individual")}
              className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                planToggle === "individual" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
              }`}
              data-testid="button-toggle-individual"
            >
              Individual
            </button>
            <button
              onClick={() => setPlanToggle("business")}
              className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                planToggle === "business" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
              }`}
              data-testid="button-toggle-business"
            >
              Business
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${displayPlans.length <= 2 ? "lg:grid-cols-2 max-w-2xl mx-auto" : "lg:grid-cols-4"}`}>
            {displayPlans.map((plan, i) => (
              <PlanCard
                key={plan.slug}
                {...plan}
                index={i}
                onSelect={handleSelectPlan}
                buttonLabel={isAuthenticated ? `Activate ${plan.name}` : "Create Account to Continue"}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid gap-6 lg:grid-cols-[1.05fr_.95fr]"
        >
          <div className="bg-white rounded-[1.8rem] border border-gray-200 p-8">
            <h3 className="text-2xl font-black text-black mb-6">All plans include</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Searchable profile in the directory",
                "Custom talent tags",
                "Location-based discovery",
                "Profile analytics",
                "Direct contact information",
                "Annual membership management",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[#E50914] mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black rounded-[1.8rem] p-8 text-white">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45 mb-2">Best Fit</p>
            <h3 className="text-2xl font-black mb-4">
              Individual if you want exposure. Business if you want reach and recruiting power.
            </h3>
            <div className="space-y-3 text-sm text-white/70">
              <p>Use an individual plan when your main goal is getting discovered as a creator.</p>
              <p>Use a business plan when you need to hire, promote, and maintain a stronger brand presence from one account.</p>
              <p>Every plan feeds back into the same product: directory visibility, dashboard control, and better next steps.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
