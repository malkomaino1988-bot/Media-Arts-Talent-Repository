import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Search, Briefcase, Monitor, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TalentCard from "@/components/TalentCard";
import PlanCard from "@/components/PlanCard";
import { useGetFeaturedTalents, useGetMembershipPlans } from "@workspace/api-client-react";

const TALENT_TYPES = [
  "Photographer", "Filmmaker", "Videographer", "Musician", "Voice Actor",
  "Graphic Designer", "Actor", "Model", "Producer", "Sound Engineer",
  "Animator", "Writer", "DJ", "Makeup Artist", "Art Director",
];

const HERO_IMAGE = `${import.meta.env.BASE_URL}opengraph.jpg`;

export default function HomePage() {
  const [planToggle, setPlanToggle] = useState<"individual" | "business">("individual");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: featuredTalents, isLoading: loadingTalents } = useGetFeaturedTalents();
  const { data: plans, isLoading: loadingPlans } = useGetMembershipPlans();

  const individualPlans = plans?.filter((p) => !p.isBusinessPlan) ?? [];
  const businessPlans = plans?.filter((p) => p.isBusinessPlan) ?? [];
  const displayPlans = planToggle === "individual" ? individualPlans : businessPlans;

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-black min-h-[92vh] flex items-center">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, rgba(229,9,20,.55) 0%, transparent 28%), radial-gradient(circle at 82% 12%, rgba(255,255,255,.12) 0%, transparent 26%), linear-gradient(180deg, rgba(0,0,0,.12), rgba(0,0,0,.6))",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(255,255,255,.08) 25%, rgba(255,255,255,.08) 26%, transparent 27%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.08) 25%, rgba(255,255,255,.08) 26%, transparent 27%)",
            backgroundSize: "52px 52px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-5xl md:text-7xl lg:text-[5.4rem] font-black text-white leading-[0.92] tracking-tight mb-6">
                Connect with content creators through the Media Arts Talent Repository -{" "}
                <span className="text-[#E50914]">MATR.</span>
              </h1>

              <p className="text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
                Welcome to our media arts talent repository where you can gain exposure for your creative talents - or an opportunity to be a part of your cast, crew or team.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/explore">
                  <Button
                    size="lg"
                    className="bg-[#E50914] hover:bg-[#b40710] text-white font-bold text-base px-8 h-12 rounded-xl group"
                    data-testid="button-explore-talent"
                  >
                    Explore Talent
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white bg-white/10 hover:bg-white/20 font-bold text-base px-8 h-12 rounded-xl backdrop-blur-sm"
                    data-testid="button-join-directory"
                  >
                    Join the Directory
                  </Button>
                </Link>
              </div>

              <div className="mt-14 grid grid-cols-3 gap-6 max-w-sm">
                {[
                  { value: "MATR", label: "Creative Directory" },
                  { value: "15+", label: "Talent Types" },
                  { value: "Local", label: "Cast, Crew, Team" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative lg:pl-4"
            >
              <div className="relative h-[420px] sm:h-[520px] lg:h-[640px] overflow-hidden rounded-[34px] border border-white/10 bg-neutral-900 shadow-[0_30px_80px_rgba(0,0,0,.45)]">
                <img
                  src={HERO_IMAGE}
                  alt="Creative professionals collaborating"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-black via-black/60 to-transparent" />
                <div className="absolute right-0 top-0 h-full w-full bg-[radial-gradient(circle_at_82%_18%,rgba(229,9,20,.34),transparent_24%)]" />
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="text-white/40" size={28} />
        </motion.div>
      </section>

      <section className="py-20 bg-[#F5F5F5]" id="membership">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_.9fr] gap-10 items-center mb-12"
          >
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
                Join our creative talent directory.
              </h2>
              <p className="text-gray-500 text-lg max-w-xl">
                Individual plans range from $25/year to $250/year, with business options available when you need more reach.
              </p>

              <div className="mt-8 inline-flex bg-white rounded-xl p-1.5 border border-gray-200 shadow-sm">
                <button
                  onClick={() => setPlanToggle("individual")}
                  className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                    planToggle === "individual"
                      ? "bg-black text-white shadow-sm"
                      : "text-gray-500 hover:text-black"
                  }`}
                  data-testid="button-toggle-individual"
                >
                  Individual
                </button>
                <button
                  onClick={() => setPlanToggle("business")}
                  className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                    planToggle === "business"
                      ? "bg-black text-white shadow-sm"
                      : "text-gray-500 hover:text-black"
                  }`}
                  data-testid="button-toggle-business"
                >
                  Business
                </button>
              </div>
            </div>

            <div className="relative h-[280px] md:h-[320px] overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-sm">
              <img
                src={HERO_IMAGE}
                alt="Talent directory preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/76 to-transparent" />
              <div className="absolute left-0 top-0 flex h-full max-w-[60%] flex-col justify-end p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E50914]">
                  Membership
                </p>
                <p className="mt-3 text-2xl font-black text-black">
                  Build a stronger profile and get seen faster.
                </p>
              </div>
            </div>
          </motion.div>

          {loadingPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-white rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${displayPlans.length <= 2 ? "lg:grid-cols-2 max-w-2xl mx-auto" : "lg:grid-cols-4"}`}>
              {displayPlans.map((plan, i) => (
                <PlanCard key={plan.slug} {...plan} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
              Discover Talent
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Search our database for talent to build your cast, crew, or creative team.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, talent, or keyword..."
                  className="pl-10 h-12 rounded-xl border-gray-200 text-base"
                  data-testid="input-search-talent"
                />
              </div>
              <Link href={`/explore${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`}>
                <Button
                  size="lg"
                  className="bg-[#E50914] hover:bg-[#b40710] text-white font-semibold h-12 px-6 rounded-xl"
                  data-testid="button-search-submit"
                >
                  Search
                </Button>
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-400 mr-1">Popular:</span>
              {TALENT_TYPES.slice(0, 6).map((type) => (
                <Link key={type} href={`/explore?talentType=${encodeURIComponent(type)}`}>
                  <span className="text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 cursor-pointer transition-colors">
                    {type}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {loadingTalents ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : featuredTalents && featuredTalents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {featuredTalents.slice(0, 8).map((talent, i) => (
                  <TalentCard key={talent.id} {...talent} index={i} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link href="/explore">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-black text-black hover:bg-black hover:text-white font-semibold px-8 rounded-xl"
                    data-testid="button-view-all-talent"
                  >
                    View All Talent
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <Link href="/explore">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-black text-black hover:bg-black hover:text-white font-semibold px-8 rounded-xl"
                  data-testid="button-view-directory-fallback"
                >
                  Browse the Directory
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-[#222222] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 mb-6">
                <Briefcase size={14} className="text-[#E50914]" />
                <span className="text-white/70 text-sm font-medium">Jobs</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                Hire Content Creators / Talent
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-6">
                Use Browse Jobs to review current opportunities. Once you are ready to reach creators directly, use Post a Job to share the role with the MATR community.
              </p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black text-[#E50914]">$100</span>
                <span className="text-white/50">per posting / 2 months</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/post-job">
                  <Button
                    size="lg"
                    className="bg-[#E50914] hover:bg-[#b40710] text-white font-bold px-8 h-12 rounded-xl"
                    data-testid="button-post-job"
                  >
                    Post a Job
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-12 rounded-xl"
                    data-testid="button-browse-jobs"
                  >
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative h-[420px] overflow-hidden rounded-[30px] border border-white/10 bg-neutral-900">
                <img
                  src={HERO_IMAGE}
                  alt="Creative hiring board"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                <div className="absolute left-0 top-0 flex h-full max-w-[70%] flex-col justify-end p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E50914]">
                    Browse first
                  </p>
                  <p className="mt-3 text-3xl font-black text-white leading-tight">
                    Review current jobs, then post when you know the role you need to fill.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 mb-6">
              <Monitor size={14} className="text-gray-500" />
              <span className="text-gray-500 text-sm font-medium">Advertising</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
              Reach Content Creators
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Promote your brand, project, or service to engaged content creators.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Sidebar Advertisement",
                price: "$30/month",
                description: "Prominent sidebar placement visible across the directory.",
                specs: "300 × 250px recommended",
                badge: "Most Visible",
              },
              {
                name: "Footer Advertisement",
                price: "$15/month",
                description: "Footer banner placement for broad visibility across the site.",
                specs: "728 × 90px recommended",
                badge: "Best Value",
              },
            ].map((ad, i) => (
              <motion.div
                key={ad.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="border border-gray-200 rounded-2xl p-7 hover:border-gray-300 hover:shadow-md transition-all h-full">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-black">{ad.name}</h3>
                    <span className="text-xs bg-black text-white px-2.5 py-1 rounded-full font-semibold">
                      {ad.badge}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-[#E50914] mb-3">{ad.price}</div>
                  <p className="text-gray-500 text-sm mb-4">{ad.description}</p>
                  <p className="text-gray-400 text-xs mb-6 font-mono">{ad.specs}</p>
                  <Link href="/advertise">
                    <Button
                      className="w-full bg-black hover:bg-gray-800 text-white font-semibold rounded-xl"
                      data-testid={`button-advertise-${i}`}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#E50914]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_.95fr] gap-10 items-center"
          >
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                Join our creative talent directory.
              </h2>
              <p className="text-white/78 text-lg mb-10 max-w-xl">
                Plans range from $25/year to $250/yr.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-white text-[#E50914] hover:bg-gray-100 font-bold px-10 h-12 rounded-xl"
                    data-testid="button-cta-join"
                  >
                    Join the Directory
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/50 text-white hover:bg-white/10 font-bold px-10 h-12 rounded-xl"
                    data-testid="button-cta-explore"
                  >
                    Explore First
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative h-[320px] md:h-[380px] overflow-hidden rounded-[30px] border border-white/20 bg-[#b40710]">
              <img
                src={HERO_IMAGE}
                alt="Creative directory members"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#E50914] via-[#E50914]/76 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(255,255,255,.18),transparent_24%)]" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
