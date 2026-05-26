import { useState } from "react";
import { motion } from "framer-motion";
import PlanCard from "@/components/PlanCard";
import { useGetMembershipPlans } from "@workspace/api-client-react";

const HERO_IMAGE = `${import.meta.env.BASE_URL}opengraph.jpg`;

export default function MembershipPage() {
  const [planToggle, setPlanToggle] = useState<"individual" | "business">("individual");
  const { data: plans, isLoading } = useGetMembershipPlans();

  const individualPlans = plans?.filter((p) => !p.isBusinessPlan) ?? [];
  const businessPlans = plans?.filter((p) => p.isBusinessPlan) ?? [];
  const displayPlans = planToggle === "individual" ? individualPlans : businessPlans;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_.95fr] gap-10 items-center">
            <div className="max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-black mb-4"
              >
                Join our creative talent directory.
              </motion.h1>
              <p className="text-white/60 text-lg max-w-xl">
                Individual plans range from $25/year to $250/yr, with business options available when you need hiring and branding tools.
              </p>
            </div>

            <div className="relative h-[280px] md:h-[320px] overflow-hidden rounded-[30px] border border-white/10 bg-neutral-900">
              <img
                src={HERO_IMAGE}
                alt="Creative membership preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/46 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <PlanCard key={plan.slug} {...plan} index={i} />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-white rounded-2xl border border-gray-200 p-8 max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-black text-black mb-6 text-center">
            All plans include
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Searchable profile in directory",
              "Custom talent tags",
              "Location-based discovery",
              "Profile analytics",
              "Direct contact information",
              "Annual membership",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#E50914] rounded-full flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
