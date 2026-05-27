import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, CheckCircle2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListJobs, getListJobsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { buildAuthHref } from "@/lib/auth-routes";

const CATEGORIES = [
  "Photography", "Film & Video", "Music", "Graphic Design", "Voice Acting",
  "Acting & Performance", "Modeling", "Production", "Sound Engineering",
  "Animation", "Writing & Content",
];
const CITIES = ["Windsor", "Tecumseh", "LaSalle", "Amherstburg", "Essex", "Leamington"];

export default function JobsPage() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);

  const params: Record<string, string | number> = { page, limit: 10 };
  if (search) params.search = search;
  if (city) params.city = city;
  if (category) params.category = category;

  const { data, isLoading } = useListJobs(params, {
    query: { queryKey: getListJobsQueryKey(params) },
  });

  const sortedJobs = [...(data?.jobs ?? [])].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "talent-asc") return a.category.localeCompare(b.category);
    if (sortBy === "talent-desc") return b.category.localeCompare(a.category);
    if (sortBy === "city-asc") return a.city.localeCompare(b.city);
    if (sortBy === "city-desc") return b.city.localeCompare(a.city);
    return 0;
  });

  const hasFilters = Boolean(search || city || category);

  const clearFilters = () => {
    setSearch("");
    setCity("");
    setCategory("");
    setSortBy("recent");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-black mb-4"
              >
                Browse Jobs
              </motion.h1>
              <p className="text-white/50 text-lg max-w-3xl">
                Review current opportunities, then narrow the list by talent type or city.
              </p>
            </div>
            <Link href="/post-job">
              <Button
                className="flex-shrink-0 bg-[#E50914] hover:bg-[#b40710] text-white font-bold px-6 h-11 rounded-xl"
                data-testid="button-post-job"
              >
                Post a Job
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr] mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search jobs..."
                  className="pl-10 h-11 rounded-xl border-gray-200"
                  data-testid="input-job-search"
                />
              </div>
              <Select value={category} onValueChange={(value) => { setCategory(value === "all" ? "" : value); setPage(1); }}>
                <SelectTrigger className="h-11 rounded-xl border-gray-200" data-testid="select-job-category">
                  <SelectValue placeholder="Talent Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Talent Type</SelectItem>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={city} onValueChange={(value) => { setCity(value === "all" ? "" : value); setPage(1); }}>
                <SelectTrigger className="h-11 rounded-xl border-gray-200" data-testid="select-job-city">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any City</SelectItem>
                  {CITIES.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 rounded-xl border-gray-200" data-testid="select-job-sort">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="talent-asc">Talent A-Z</SelectItem>
                  <SelectItem value="talent-desc">Talent Z-A</SelectItem>
                  <SelectItem value="city-asc">City A-Z</SelectItem>
                  <SelectItem value="city-desc">City Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Sort by talent or city, then contact listings directly from the board.
              </p>
              {hasFilters && (
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={clearFilters}
                  data-testid="button-clear-job-filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <div className="bg-black rounded-[1.8rem] p-6 text-white">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45 mb-4">How To Use The Board</p>
            <div className="space-y-3 text-sm text-white/70">
              {[
                "Browse active roles first so you can compare category, city, and compensation.",
                "Use the filters to tighten the list instead of scanning every listing manually.",
                "When you are ready to hire, post a role and return to the dashboard to track it.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#E50914] mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sortedJobs.length > 0 ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-gray-500 text-sm" data-testid="text-jobs-count">
                {data?.total} job{data?.total !== 1 ? "s" : ""} available
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                <span className="rounded-full bg-[#F5F5F5] px-3 py-1">Direct contact</span>
                <span className="rounded-full bg-[#F5F5F5] px-3 py-1">City sorting</span>
                <span className="rounded-full bg-[#F5F5F5] px-3 py-1">Talent sorting</span>
              </div>
            </div>
            <div className="space-y-4">
              {sortedJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-[1.6rem] border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all"
                  data-testid={`card-job-${job.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-11 h-11 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Briefcase size={17} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-black text-lg" data-testid={`text-job-title-${job.id}`}>
                            {job.title}
                          </h3>
                          <p className="text-gray-500 text-sm">{job.company}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mt-3 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <MapPin size={12} />
                          <span>{job.city}, {job.province}</span>
                        </div>
                        <span className="text-xs bg-[#E50914]/10 text-[#E50914] px-2.5 py-1 rounded-full font-semibold">
                          {job.category}
                        </span>
                        {job.compensation && (
                          <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                            {job.compensation}
                          </span>
                        )}
                      </div>
                    </div>
                    <a href={`mailto:${job.contactEmail}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0 rounded-xl"
                        data-testid={`button-apply-${job.id}`}
                      >
                        Apply
                      </Button>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <Briefcase size={28} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">
              {hasFilters ? "No jobs match these filters" : "No jobs posted yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {hasFilters
                ? "Reset the filters to review every active opportunity, or post a new role if you are hiring."
                : "Be the first to post a creative opportunity for the MATR community."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {hasFilters && (
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={clearFilters}
                  data-testid="button-reset-empty-job-filters"
                >
                  Clear Filters
                </Button>
              )}
              <Link href="/explore">
                <Button variant="outline" className="rounded-xl" data-testid="button-browse-talent">
                  Browse Talent
                </Button>
              </Link>
              <Link href={isAuthenticated ? "/post-job" : buildAuthHref("/sign-up", { redirectTo: "/post-job" })}>
                <Button className="bg-[#E50914] hover:bg-[#b40710] text-white font-semibold rounded-xl" data-testid="button-first-job">
                  {isAuthenticated ? "Post a Job" : "Create Account to Post"}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
