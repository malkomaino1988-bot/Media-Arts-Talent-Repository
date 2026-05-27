import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TalentCard from "@/components/TalentCard";
import { useListTalents, getListTalentsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { buildAuthHref } from "@/lib/auth-routes";

const TALENT_TYPES = [
  "Photographer", "Filmmaker", "Videographer", "Musician", "Voice Actor",
  "Graphic Designer", "Actor", "Model", "Producer", "Sound Engineer",
  "Animator", "Writer", "DJ", "Makeup Artist", "Art Director",
  "Editor", "Illustrator", "Set Designer",
];
const CITIES = ["Windsor", "Tecumseh", "LaSalle", "Amherstburg", "Essex", "Leamington"];

export default function ExplorePage() {
  const { isAuthenticated } = useAuth();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialTalentType = searchParams.get("talentType") ?? "";

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [selectedTalentTypes, setSelectedTalentTypes] = useState(
    initialTalentType
      ? initialTalentType.split(",").map((item) => item.trim()).filter(Boolean)
      : [],
  );
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [minExperience, setMinExperience] = useState(searchParams.get("minExperience") ?? "");
  const [page, setPage] = useState(1);

  const params: Record<string, string | number> = { page, limit: 12 };
  if (search) params.search = search;
  if (city) params.city = city;
  if (minExperience) params.minExperience = Number(minExperience);
  if (selectedTalentTypes.length > 0) params.talentType = selectedTalentTypes.join(",");

  const { data, isLoading } = useListTalents(params, {
    query: { queryKey: getListTalentsQueryKey(params) },
  });

  const activeFilters = [
    city && { key: "city", label: city },
    minExperience && { key: "minExperience", label: `${minExperience}+ years` },
    ...selectedTalentTypes.map((type) => ({ key: `talentType:${type}`, label: type })),
  ].filter(Boolean) as { key: string; label: string }[];

  const toggleTalentType = (talent: string) => {
    setSelectedTalentTypes((current) => (
      current.includes(talent)
        ? current.filter((item) => item !== talent)
        : [...current, talent]
    ));
    setPage(1);
  };

  const removeFilter = (key: string) => {
    if (key === "city") setCity("");
    if (key === "minExperience") setMinExperience("");
    if (key.startsWith("talentType:")) {
      const talent = key.replace("talentType:", "");
      setSelectedTalentTypes((current) => current.filter((item) => item !== talent));
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1ed]">
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_.9fr] lg:items-end">
            <div>
              <div className="matr-dark-kicker mb-4">
                <Sparkles size={12} className="text-[#E50914]" />
                Talent Directory
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-black mb-4"
              >
                Discover Talent
              </motion.h1>
              <p className="text-white/50 text-lg max-w-3xl">
                Search our database for talent to build your cast, crew, or creative team.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: "Location", label: "Optional filter" },
                { value: "Experience", label: "Optional filter" },
                { value: "Checklist", label: "Visible talent types" },
              ].map((item) => (
                <div key={item.label} className="matr-dark-panel p-4">
                  <p className="text-2xl font-black text-white">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/35">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr] mb-6">
          <div className="matr-premium-card p-5">
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_.8fr_.8fr] gap-3 mb-5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by name, title, or skill..."
                  className="pl-10 h-11 rounded-xl border-gray-200"
                  data-testid="input-explore-search"
                />
              </div>

              <Select value={city} onValueChange={(value) => { setCity(value === "all" ? "" : value); setPage(1); }}>
                <SelectTrigger className="rounded-xl border-gray-200 h-11" data-testid="select-city">
                  <SelectValue placeholder="Location (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Location</SelectItem>
                  {CITIES.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={minExperience} onValueChange={(value) => { setMinExperience(value === "all" ? "" : value); setPage(1); }}>
                <SelectTrigger className="rounded-xl border-gray-200 h-11" data-testid="select-experience">
                  <SelectValue placeholder="Years of Experience (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Experience</SelectItem>
                  <SelectItem value="1">1+ years</SelectItem>
                  <SelectItem value="3">3+ years</SelectItem>
                  <SelectItem value="5">5+ years</SelectItem>
                  <SelectItem value="10">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-black">Talent Types</h2>
                  <p className="text-sm text-gray-500">Select one or more specialties.</p>
                </div>
                {selectedTalentTypes.length > 0 && (
                  <button
                    onClick={() => { setSelectedTalentTypes([]); setPage(1); }}
                    className="text-sm text-gray-400 hover:text-black transition-colors"
                  >
                    Clear talent types
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
                {TALENT_TYPES.map((talent) => {
                  const selected = selectedTalentTypes.includes(talent);
                  return (
                    <label
                      key={talent}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors cursor-pointer ${
                        selected
                          ? "border-black bg-black text-white shadow-[0_18px_30px_rgba(17,17,17,0.16)]"
                          : "border-gray-200 bg-white/90 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleTalentType(talent)}
                        className="sr-only"
                      />
                      <span className={`h-2.5 w-2.5 rounded-full ${selected ? "bg-[#E50914]" : "bg-gray-300"}`} />
                      <span>{talent}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                {activeFilters.map((filter) => (
                  <span
                    key={filter.key}
                    className="flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white shadow-[0_14px_24px_rgba(17,17,17,0.14)]"
                  >
                    {filter.label}
                    <button onClick={() => removeFilter(filter.key)} className="hover:opacity-70">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => { setSearch(""); setCity(""); setMinExperience(""); setSelectedTalentTypes([]); setPage(1); }}
                  className="text-xs text-gray-400 hover:text-black transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <div className="matr-dark-panel p-6 text-white">
            <div className="relative z-10 flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-[#E50914]" />
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Search Strategy</p>
            </div>
            <div className="relative z-10 space-y-3 text-sm text-white/70">
              {[
                "Start broad with one or two talent types, then narrow by city or experience.",
                "Use the visible checklist to compare specialties at a glance before applying filters.",
                "Open strong profiles and use their next-step actions to keep moving inside the product.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#E50914] mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="relative z-10 mt-6 grid gap-3">
              {[
                `${selectedTalentTypes.length || "No"} talent type${selectedTalentTypes.length === 1 ? "" : "s"} selected`,
                city || "Any location selected",
                minExperience ? `${minExperience}+ years minimum experience` : "Any experience level",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-52 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : data?.talents && data.talents.length > 0 ? (
          <>
            <div className="matr-premium-card mb-5 flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <p className="text-gray-500 text-sm" data-testid="text-results-count">
                {data.total} talent{data.total !== 1 ? "s" : ""} found
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                <span className="matr-chip">Public profiles</span>
                <span className="matr-chip">Location-aware</span>
                <span className="matr-chip">Ready to review</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {data.talents.map((talent, i) => (
                <TalentCard key={talent.id} {...talent} index={i} />
              ))}
            </div>
            {data.total > 12 && (
              <div className="flex justify-center gap-3 mt-10">
                <Button
                  variant="outline"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="rounded-xl"
                  data-testid="button-prev-page"
                >
                  Previous
                </Button>
                <span className="flex items-center text-sm text-gray-500 px-4">
                  Page {page} of {Math.ceil(data.total / 12)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page >= Math.ceil(data.total / 12)}
                  className="rounded-xl"
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <Search size={28} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">No talent found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => { setSearch(""); setCity(""); setMinExperience(""); setSelectedTalentTypes([]); setPage(1); }}
                variant="outline"
                className="rounded-xl"
                data-testid="button-clear-search"
              >
                Clear Search
              </Button>
              <a href="/jobs" className="inline-flex">
                <Button variant="outline" className="rounded-xl">
                  Browse Jobs
                </Button>
              </a>
              <a href={isAuthenticated ? "/dashboard" : buildAuthHref("/sign-up", { redirectTo: "/membership" })} className="inline-flex">
                <Button className="bg-[#E50914] hover:bg-[#b40710] text-white rounded-xl gap-2">
                  {isAuthenticated ? "Open Dashboard" : "Create a Profile"}
                  <ArrowRight size={15} />
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
