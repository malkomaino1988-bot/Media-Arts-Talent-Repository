import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Megaphone,
  Monitor,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TalentCard from "@/components/TalentCard";
import PlanCard from "@/components/PlanCard";
import { useGetFeaturedTalents, useGetMembershipPlans } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { buildAuthHref } from "@/lib/auth-routes";

const TALENT_TYPES = [
  "Photographer", "Filmmaker", "Videographer", "Musician", "Voice Actor",
  "Graphic Designer", "Actor", "Model", "Producer", "Sound Engineer",
  "Animator", "Writer", "DJ", "Makeup Artist", "Art Director",
];

const HERO_IMAGE = `${import.meta.env.BASE_URL}opengraph.jpg`;

const WORKFLOWS = [
  {
    icon: Users,
    title: "Find talent fast",
    text: "Search the directory by specialty, city, and experience so you can build a cast, crew, or campaign team without guessing.",
    href: "/explore",
    cta: "Explore talent",
  },
  {
    icon: Briefcase,
    title: "Post clear opportunities",
    text: "Create public job listings that give creators the exact details they need to respond quickly and professionally.",
    href: "/post-job",
    cta: "Post a job",
  },
  {
    icon: Megaphone,
    title: "Promote your brand",
    text: "Run simple placements that keep your project visible to a focused local creative audience.",
    href: "/advertise",
    cta: "Advertise",
  },
];

export default function HomePage() {
  const [planToggle, setPlanToggle] = useState<"individual" | "business">("individual");
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuth();

  const { data: featuredTalents, isLoading: loadingTalents } = useGetFeaturedTalents();
  const { data: plans, isLoading: loadingPlans } = useGetMembershipPlans();

  const individualPlans = plans?.filter((p) => !p.isBusinessPlan) ?? [];
  const businessPlans = plans?.filter((p) => p.isBusinessPlan) ?? [];
  const displayPlans = planToggle === "individual" ? individualPlans : businessPlans;

  return (
    <div className="bg-[#f3f1ed]">
      <section className="relative flex min-h-[94vh] items-center overflow-hidden bg-black">
        <div className="absolute inset-0 matr-grid opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(229,9,20,0.34),transparent_20%),radial-gradient(circle_at_84%_14%,rgba(255,255,255,0.14),transparent_22%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.74))]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1.06fr_.94fr] gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <div className="matr-dark-kicker mb-7">
                <Sparkles size={14} className="text-[#E50914]" />
                Creative discovery, hiring, and promotion in one product
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-[5.35rem] font-black text-white leading-[0.92] tracking-tight mb-6">
                Connect with content creators through the Media Arts Talent Repository
                <span className="text-[#E50914]">.</span>
              </h1>

              <p className="mb-10 max-w-2xl text-lg leading-relaxed text-white/72 md:text-xl">
                Welcome to our media arts talent repository where you can gain exposure for your creative talents, or find the right people to join your cast, crew, or team.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link href="/explore">
                  <Button
                    size="lg"
                    className="bg-[#E50914] hover:bg-[#b40710] text-white font-bold text-base px-8 h-12 rounded-xl group shadow-[0_18px_30px_rgba(229,9,20,0.22)]"
                    data-testid="button-explore-talent"
                  >
                    Explore Talent
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href={isAuthenticated ? "/dashboard" : buildAuthHref("/sign-up", { redirectTo: "/membership" })}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white bg-white/6 hover:bg-white/12 font-bold text-base px-8 h-12 rounded-xl backdrop-blur-sm"
                    data-testid="button-join-directory"
                  >
                    {isAuthenticated ? "Open Dashboard" : "Join the Directory"}
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
                <div className="matr-dark-panel p-4">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search photographers, actors, editors, or keywords"
                        className="pl-10 h-12 rounded-xl border-white/10 bg-black/30 text-white placeholder:text-white/30"
                        data-testid="input-search-talent"
                      />
                    </div>
                    <Link href={`/explore${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`}>
                      <Button
                        size="lg"
                        className="bg-white text-black hover:bg-gray-100 font-semibold h-12 px-6 rounded-xl"
                        data-testid="button-search-submit"
                      >
                        Search
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {TALENT_TYPES.slice(0, 6).map((type) => (
                      <Link key={type} href={`/explore?talentType=${encodeURIComponent(type)}`}>
                        <span className="inline-flex cursor-pointer rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/72 transition-colors hover:bg-white/10">
                          {type}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:w-[260px]">
                  {[
                    { value: "15+", label: "Talent Types" },
                    { value: "Jobs", label: "Hiring Board" },
                    { value: "Ads", label: "Brand Reach" },
                  ].map((stat) => (
                    <div key={stat.label} className="matr-dark-panel p-4 text-center">
                      <p className="text-2xl font-black text-white">{stat.value}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/35">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative"
            >
              <div className="relative h-[520px] overflow-hidden rounded-[2.4rem] border border-white/10 bg-neutral-900 shadow-[0_30px_80px_rgba(0,0,0,.45)] lg:h-[680px]">
                <img
                  src={HERO_IMAGE}
                  alt="Creative professionals collaborating"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/28 to-transparent" />
                <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-black via-black/82 to-transparent" />
                <div className="absolute right-0 top-0 h-full w-full bg-[radial-gradient(circle_at_78%_16%,rgba(229,9,20,0.3),transparent_22%)]" />
                <div className="absolute inset-y-0 right-0 w-[44%] bg-gradient-to-l from-black/16 to-transparent" />

                <div className="absolute left-6 top-6 right-6 flex justify-between gap-4">
                  <div className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white backdrop-blur-md">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Directory</p>
                    <p className="mt-1 text-sm font-semibold">Search talent, compare specialties, move faster.</p>
                  </div>
                  <div className="hidden sm:block rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-right text-white backdrop-blur-md">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">MATR</p>
                    <p className="mt-1 text-sm font-semibold">Built for creative work that needs real momentum.</p>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 grid gap-3 md:grid-cols-3">
                  {[
                    "Public profiles that feel review-ready",
                    "Job posting flow with clear conversion paths",
                    "Advertising placements tied back to the dashboard",
                  ].map((point) => (
                    <div key={point} className="rounded-2xl border border-white/10 bg-black/62 p-4 text-sm text-white/78 backdrop-blur-md">
                      <CheckCircle2 size={16} className="text-[#E50914] mb-2" />
                      {point}
                    </div>
                  ))}
                </div>
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

      <section className="bg-[#f3f1ed] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <div className="matr-section-kicker mb-3">
                <Sparkles size={12} className="text-[#E50914]" />
                How The Product Works
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
                Built to move people from discovery to action.
              </h2>
              <p className="text-gray-500 text-lg">
                MATR is strongest when every page leads naturally into the next step. These are the three paths that matter most.
              </p>
            </div>
            <Link href={isAuthenticated ? "/dashboard" : buildAuthHref("/sign-in", { redirectTo: "/dashboard" })}>
              <Button variant="outline" className="rounded-xl border-black text-black hover:bg-black hover:text-white">
                {isAuthenticated ? "View Member Dashboard" : "Sign In for Dashboard"}
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {WORKFLOWS.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="matr-premium-card p-7"
              >
                <div className="relative z-10 flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-[0_14px_30px_rgba(17,17,17,0.16)]">
                    <item.icon size={18} />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-300">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="relative z-10 text-2xl font-black text-black mb-3">{item.title}</h3>
                <p className="relative z-10 text-gray-500 leading-relaxed mb-6">{item.text}</p>
                <Link href={item.href}>
                  <Button variant="outline" className="relative z-10 rounded-xl border-gray-200 gap-2 bg-white/80">
                    {item.cta}
                    <ArrowRight size={15} />
                  </Button>
                </Link>
              </motion.div>
            ))}
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
            className="grid grid-cols-1 lg:grid-cols-[1fr_.92fr] gap-10 items-center mb-12"
          >
            <div className="max-w-2xl">
              <div className="matr-section-kicker mb-3">
                <Sparkles size={12} className="text-[#E50914]" />
                Membership
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
                Join our creative talent directory.
              </h2>
              <p className="text-gray-500 text-lg max-w-xl">
                Individual plans range from $25/year to $250/year, with business options when you need hiring and promotion tools in the same account.
              </p>

              <div className="mt-8 inline-flex bg-[#F5F5F5] rounded-xl p-1.5 border border-gray-200 shadow-sm">
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

            <div className="relative h-[300px] overflow-hidden rounded-[2.2rem] border border-gray-200 bg-white shadow-sm md:h-[340px]">
              <img
                src={HERO_IMAGE}
                alt="Talent directory preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/82 to-transparent" />
              <div className="absolute right-6 top-6 hidden rounded-[1.3rem] border border-black/8 bg-white/92 px-5 py-4 shadow-[0_14px_36px_rgba(17,17,17,0.08)] md:block">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Plans</p>
                <p className="mt-2 text-2xl font-black text-black">$25 to $250</p>
                <p className="mt-1 text-sm text-gray-500">Built for visibility, hiring, and growth.</p>
              </div>
              <div className="absolute left-0 top-0 flex h-full max-w-[62%] flex-col justify-end p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E50914]">
                  Membership
                </p>
                <p className="mt-3 text-3xl font-black text-black">
                  Build a stronger profile and turn visibility into action.
                </p>
              </div>
            </div>
          </motion.div>

          {loadingPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-[#F5F5F5] rounded-2xl animate-pulse" />
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

      <section className="py-20 bg-[#111111] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="matr-dark-kicker mb-3">
                <Sparkles size={12} className="text-[#E50914]" />
                Directory Preview
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Discover Talent
              </h2>
              <p className="text-white/60 text-lg">
                Search our database for talent to build your cast, crew, or creative team.
              </p>
            </div>
            <Link href="/explore">
              <Button className="bg-[#E50914] hover:bg-[#b40710] text-white font-semibold rounded-xl">
                Open Full Directory
              </Button>
            </Link>
          </div>

          {loadingTalents ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-white/8 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : featuredTalents && featuredTalents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredTalents.slice(0, 8).map((talent, i) => (
                <TalentCard key={talent.id} {...talent} index={i} />
              ))}
            </div>
          ) : (
            <div className="matr-dark-panel p-8">
              <p className="text-white/75 font-semibold mb-2">The directory is ready to browse.</p>
              <p className="text-white/50 mb-5">
                Featured members will appear here as more profiles are completed and upgraded.
              </p>
              <Link href="/explore">
                <Button variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10 rounded-xl">
                  Browse the Directory
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="matr-section-kicker mb-6 border-black/10 bg-black text-white shadow-none">
                <Briefcase size={14} className="text-[#E50914]" />
                <span className="text-white/70 text-sm font-medium tracking-normal">Jobs</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6 text-black">
                Hire Content Creators / Talent
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Use Browse Jobs to review current opportunities. Once you know the role you need to fill, use Post a Job to reach the MATR community directly.
              </p>
              <div className="grid gap-3 mb-8">
                {[
                  "Browse active listings before posting to understand the market.",
                  "Sort by talent type or city to compare roles quickly.",
                  "Return to your dashboard after checkout to manage every listing.",
                ].map((item) => (
                  <div key={item} className="matr-premium-card flex items-start gap-3 p-4">
                    <CheckCircle2 size={18} className="text-[#E50914] mt-0.5" />
                    <p className="relative z-10 text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black text-[#E50914]">$100</span>
                <span className="text-gray-400">per posting / 2 months</span>
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
                    className="border-black text-black hover:bg-black hover:text-white font-semibold px-8 h-12 rounded-xl"
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
              <div className="relative h-[440px] overflow-hidden rounded-[2.2rem] border border-gray-200 bg-neutral-900">
                <img
                  src={HERO_IMAGE}
                  alt="Creative hiring board"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/44 to-transparent" />
                <div className="absolute right-6 top-6 rounded-[1.4rem] border border-white/10 bg-black/50 px-5 py-4 text-white backdrop-blur-md">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">Workflow</p>
                  <p className="mt-2 text-lg font-bold">Browse Jobs before you Post a Job.</p>
                </div>
                <div className="absolute left-0 top-0 flex h-full max-w-[72%] flex-col justify-end p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E50914]">
                    Browse first
                  </p>
                  <p className="mt-3 text-3xl font-black text-white leading-tight">
                    Review current jobs, then post when the role is clear and ready to convert.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#f3f1ed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="matr-section-kicker mb-6">
              <Monitor size={14} className="text-gray-500" />
              <span className="text-gray-500 text-sm font-medium tracking-normal">Advertising</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
              Reach Content Creators
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Promote your brand, project, or service to engaged content creators.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Sidebar Advertisement",
                price: "$30/month",
                description: "Prominent placement visible across the key browsing pages.",
                specs: "300 x 250px recommended",
                badge: "Most Visible",
              },
              {
                name: "Footer Advertisement",
                price: "$15/month",
                description: "Cost-efficient brand exposure across the site footer.",
                specs: "728 x 90px recommended",
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
                <div className="matr-premium-card h-full p-7 transition-all hover:border-gray-300 hover:shadow-md">
                  <div className="relative z-10 flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-black">{ad.name}</h3>
                    <span className="text-xs bg-black text-white px-2.5 py-1 rounded-full font-semibold">
                      {ad.badge}
                    </span>
                  </div>
                  <div className="relative z-10 text-3xl font-black text-[#E50914] mb-3">{ad.price}</div>
                  <p className="relative z-10 text-gray-500 text-sm mb-4">{ad.description}</p>
                  <p className="relative z-10 text-gray-400 text-xs mb-6 font-mono">{ad.specs}</p>
                  <Link href="/advertise">
                    <Button
                      className="relative z-10 w-full bg-black hover:bg-gray-800 text-white font-semibold rounded-xl"
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
                <Link href={isAuthenticated ? "/membership" : buildAuthHref("/sign-up", { redirectTo: "/membership" })}>
                  <Button
                    size="lg"
                    className="bg-white text-[#E50914] hover:bg-gray-100 font-bold px-10 h-12 rounded-xl"
                    data-testid="button-cta-join"
                  >
                    {isAuthenticated ? "Choose a Plan" : "Join the Directory"}
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

            <div className="relative h-[320px] overflow-hidden rounded-[2.2rem] border border-white/20 bg-[#b40710] md:h-[380px]">
              <img
                src={HERO_IMAGE}
                alt="Creative directory members"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#E50914] via-[#E50914]/78 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(255,255,255,0.18),transparent_24%)]" />
              <div className="absolute right-6 top-6 rounded-[1.4rem] border border-white/20 bg-white/12 px-5 py-4 text-white backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Final Step</p>
                <p className="mt-2 text-xl font-black">Create a profile that looks ready before anyone clicks in.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
