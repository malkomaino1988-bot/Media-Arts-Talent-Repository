import { SignUp } from "@clerk/react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMembershipPlans } from "@workspace/api-client-react";
import { clerkAppearance } from "@/lib/clerk";
import { useAuth } from "@/lib/auth";
import { buildAuthHref, getRedirectTarget } from "@/lib/auth-routes";

export default function SignUpPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const selectedPlan = searchParams.get("plan") ?? "";
  const redirectTarget = getRedirectTarget(selectedPlan ? `/membership?plan=${encodeURIComponent(selectedPlan)}` : "/dashboard");
  const { data: plans } = useGetMembershipPlans();
  const selectedPlanData = plans?.find((plan) => plan.slug === selectedPlan) ?? null;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation(user?.role === "admin" && redirectTarget === "/dashboard" ? "/admin" : redirectTarget);
    }
  }, [isAuthenticated, isLoading, redirectTarget, setLocation, user?.role]);

  return (
    <div className="min-h-screen bg-[#f3f1ed]">
      <div className="bg-black py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-center"
          >
            <div className="matr-dark-kicker mb-5">
              <Sparkles size={12} className="text-[#E50914]" />
              Clerk Authentication
            </div>
            <h1 className="mb-5 text-4xl font-black leading-tight md:text-6xl">
              Create your MATR account with Clerk.
            </h1>
            <p className="max-w-2xl text-lg text-white/60">
              Account creation now runs through Clerk. After sign-up, we sync your account into MATR so the dashboard,
              directory profile, jobs, and admin tools continue to work on the same product data.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                "Secure hosted sign-up and sign-in flow",
                "Existing MATR user record is created or matched automatically",
                "You can finish your public profile and membership inside the product after account creation",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/6 p-4">
                  <CheckCircle2 size={18} className="mt-0.5 text-[#E50914]" />
                  <p className="text-white/78">{item}</p>
                </div>
              ))}
            </div>

            {selectedPlanData && (
              <div className="matr-dark-panel mt-8 p-6">
                <div className="relative z-10">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">Selected Plan</p>
                  <h2 className="mt-3 text-3xl font-black text-white">{selectedPlanData.name}</h2>
                  <p className="mt-2 text-white/60">
                    ${selectedPlanData.priceYearly}/year
                  </p>
                  <p className="mt-4 text-sm text-white/70">
                    Finish account creation first. You can confirm this plan from the membership flow after you land in MATR.
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="self-center"
          >
            <div className="matr-premium-card p-4 sm:p-6">
              <div className="relative z-10">
                <SignUp
                appearance={clerkAppearance}
                routing="path"
                path="/sign-up"
                signInUrl={buildAuthHref("/sign-in", { redirectTo: redirectTarget })}
                forceRedirectUrl={redirectTarget}
                fallbackRedirectUrl={redirectTarget}
              />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
