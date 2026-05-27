import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface PlanCardProps {
  name: string;
  slug: string;
  priceYearly: number;
  description: string;
  features: string[];
  isMostPopular: boolean;
  isBusinessPlan: boolean;
  jobCredits: number;
  index?: number;
  onSelect?: (slug: string) => void;
}

export default function PlanCard({
  name,
  slug,
  priceYearly,
  description,
  features,
  isMostPopular,
  isBusinessPlan,
  jobCredits,
  index = 0,
  onSelect,
}: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <div
        className={`relative h-full flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
          isMostPopular
            ? "border-[#E50914] shadow-lg bg-white"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
        }`}
        data-testid={`card-plan-${slug}`}
      >
        {isMostPopular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-[#E50914] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </span>
          </div>
        )}

        <div className="mb-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
              isBusinessPlan ? "bg-black text-white" : "bg-gray-100 text-gray-600"
            }`}>
              {isBusinessPlan ? "Business" : "Individual"}
            </span>
            {jobCredits > 0 && (
              <span className="rounded-full bg-[#E50914]/10 px-3 py-1 text-[11px] font-semibold text-[#E50914]">
                {jobCredits} job credit{jobCredits !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-black" data-testid={`text-plan-name-${slug}`}>
            {name}
          </h3>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>

        <div className="mb-6 rounded-2xl bg-[#F5F5F5] p-4">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-black" data-testid={`text-price-${slug}`}>
              ${priceYearly}
            </span>
            <span className="text-gray-500 text-sm">/year</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {isBusinessPlan
              ? "Built for hiring, promotion, and higher visibility."
              : "Built for public discovery and portfolio growth."}
          </p>
        </div>

        <ul className="space-y-2.5 mb-6 flex-1">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <Check size={10} className="text-green-600 stroke-[3]" />
              </div>
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        {onSelect ? (
          <Button
            onClick={() => onSelect(slug)}
            className={`w-full font-semibold ${
              isMostPopular
                ? "bg-[#E50914] hover:bg-[#b40710] text-white"
                : "bg-black hover:bg-gray-800 text-white"
            }`}
            data-testid={`button-select-plan-${slug}`}
          >
            Choose {name}
          </Button>
        ) : (
          <Link href={`/sign-up?plan=${slug}`}>
            <Button
              className={`w-full font-semibold ${
                isMostPopular
                  ? "bg-[#E50914] hover:bg-[#b40710] text-white"
                  : "bg-black hover:bg-gray-800 text-white"
              }`}
              data-testid={`button-get-plan-${slug}`}
            >
              Get Started
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
