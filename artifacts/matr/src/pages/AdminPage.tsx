import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Users, Briefcase, Monitor, BarChart2, TrendingUp, ShieldCheck, Search, Eye, Sparkles, Activity, Headphones } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useListUsers,
  useListAds,
  useGetStatsOverview,
  useGetTalentTypeBreakdown,
  useGetMembershipDistribution,
  getGetStatsOverviewQueryKey,
  getGetTalentTypeBreakdownQueryKey,
  getGetMembershipDistributionQueryKey,
  getListUsersQueryKey,
  getListAdsQueryKey,
  useDeleteUser,
  useDeleteJob,
  useDeleteAd,
  useUpdateUser,
  useUpdateJob,
  useUpdateAd,
  type JobListResponse,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { buildAuthHref } from "@/lib/auth-routes";

const planFilterOptions = ["All Plans", "Friend", "Bronze", "Silver", "Gold", "Gold Business", "Platinum Business"];
const jobStatusOptions = ["active", "draft", "expired"];
const adStatusOptions = ["pending", "active", "inactive"];

type AdminActivityEntry = {
  id: string;
  actorId: number;
  actorName: string;
  action: string;
  targetType: "user" | "job" | "ad" | "auth";
  targetId: number | null;
  summary: string;
  details?: Record<string, string | number | boolean | null>;
  createdAt: string;
};

type SupportTopicOption = {
  value: string;
  label: string;
  responseWindow: string;
};

type AdminSupportEntry = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  organization: string | null;
  createdAt: string;
  status: "new";
};

type SupportQueueResponse = {
  total: number;
  newCount: number;
  topics: SupportTopicOption[];
  requests: AdminSupportEntry[];
};

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();

  const [userSearch, setUserSearch] = useState("");
  const [userPlan, setUserPlan] = useState("All Plans");
  const [jobSearch, setJobSearch] = useState("");
  const [jobCity, setJobCity] = useState("");
  const [jobStatus, setJobStatus] = useState("all");
  const [adSearch, setAdSearch] = useState("");

  const usersParams = {
    search: userSearch || undefined,
    plan: userPlan === "All Plans" ? undefined : userPlan,
  };
  const jobsParams = {
    search: jobSearch || undefined,
    city: jobCity || undefined,
    status: jobStatus,
  };

  const { data: stats } = useGetStatsOverview({ query: { queryKey: getGetStatsOverviewQueryKey() } });
  const { data: talentBreakdown } = useGetTalentTypeBreakdown({ query: { queryKey: getGetTalentTypeBreakdownQueryKey() } });
  const { data: membershipDist } = useGetMembershipDistribution({ query: { queryKey: getGetMembershipDistributionQueryKey() } });

  const { data: usersData, isLoading: loadingUsers } = useListUsers(usersParams, {
    query: { queryKey: getListUsersQueryKey(usersParams) },
  });
  const { data: jobsData, isLoading: loadingJobs } = useQuery<JobListResponse>({
    queryKey: ["admin-jobs", jobsParams],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: "1",
        limit: "50",
        scope: "all",
      });

      if (jobsParams.search) query.set("search", jobsParams.search);
      if (jobsParams.city) query.set("city", jobsParams.city);
      if (jobsParams.status !== "all") query.set("status", jobsParams.status);

      const response = await fetch(`/api/jobs?${query.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load admin jobs");
      }

      return response.json() as Promise<JobListResponse>;
    },
  });
  const { data: activityData, isLoading: loadingActivity } = useQuery<AdminActivityEntry[]>({
    queryKey: ["admin-activity"],
    queryFn: async () => {
      const response = await fetch("/api/admin/activity");
      if (!response.ok) {
        throw new Error("Failed to load admin activity");
      }

      return response.json() as Promise<AdminActivityEntry[]>;
    },
  });
  const { data: supportQueue, isLoading: loadingSupport } = useQuery<SupportQueueResponse>({
    queryKey: ["admin-support-queue"],
    queryFn: async () => {
      const response = await fetch("/api/support/requests");
      if (!response.ok) {
        throw new Error("Failed to load support queue");
      }

      return response.json() as Promise<SupportQueueResponse>;
    },
  });
  const { data: adsData, isLoading: loadingAds } = useListAds({}, {
    query: { queryKey: getListAdsQueryKey({}) },
  });

  const deleteUser = useDeleteUser();
  const deleteJob = useDeleteJob();
  const deleteAd = useDeleteAd();
  const updateUser = useUpdateUser();
  const updateJob = useUpdateJob();
  const updateAd = useUpdateAd();

  const filteredAds = useMemo(() => {
    const normalized = adSearch.trim().toLowerCase();
    return (adsData ?? []).filter((ad) => {
      if (!normalized) return true;
      return [
        ad.placement,
        ad.status,
        ad.altText ?? "",
        ad.linkUrl,
      ].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [adSearch, adsData]);

  const activeMemberships = membershipDist?.reduce((sum, item) => sum + item.count, 0) ?? 0;
  const pendingAds = filteredAds.filter((ad) => ad.status === "pending").length;
  const inactiveUsers = usersData?.users.filter((entry) => !entry.isActive).length ?? 0;
  const draftJobs = jobsData?.jobs.filter((job: JobListResponse["jobs"][number]) => job.status === "draft").length ?? 0;
  const supportNewCount = supportQueue?.newCount ?? 0;
  const supportRequests = supportQueue?.requests ?? [];
  const topicLabels = new Map((supportQueue?.topics ?? []).map((topic) => [topic.value, topic.label]));

  const invalidateAdminData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey(usersParams) }),
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-activity"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-support-queue"] }),
      queryClient.invalidateQueries({ queryKey: getListAdsQueryKey({}) }),
      queryClient.invalidateQueries({ queryKey: getGetStatsOverviewQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getGetTalentTypeBreakdownQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getGetMembershipDistributionQueryKey() }),
    ]);
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser.mutateAsync({ id });
      await invalidateAdminData();
      toast({ title: "User deleted" });
    } catch {
      toast({ title: "Failed to delete user", variant: "destructive" });
    }
  };

  const handleToggleUser = async (id: number, isActive: boolean) => {
    try {
      await updateUser.mutateAsync({ id, data: { isActive: !isActive } });
      await invalidateAdminData();
      toast({ title: isActive ? "User deactivated" : "User reactivated" });
    } catch {
      toast({ title: "Failed to update user", variant: "destructive" });
    }
  };

  const handleDeleteJob = async (id: number) => {
    try {
      await deleteJob.mutateAsync({ id });
      await invalidateAdminData();
      toast({ title: "Job deleted" });
    } catch {
      toast({ title: "Failed to delete job", variant: "destructive" });
    }
  };

  const handleJobStatus = async (id: number, status: string) => {
    try {
      await updateJob.mutateAsync({ id, data: { status } });
      await invalidateAdminData();
      toast({ title: "Job status updated" });
    } catch {
      toast({ title: "Failed to update job", variant: "destructive" });
    }
  };

  const handleDeleteAd = async (id: number) => {
    try {
      await deleteAd.mutateAsync({ id });
      await invalidateAdminData();
      toast({ title: "Ad deleted" });
    } catch {
      toast({ title: "Failed to delete ad", variant: "destructive" });
    }
  };

  const handleAdStatus = async (id: number, status: string) => {
    try {
      await updateAd.mutateAsync({ id, data: { status } });
      await invalidateAdminData();
      toast({ title: "Ad status updated" });
    } catch {
      toast({ title: "Failed to update ad", variant: "destructive" });
    }
  };

  const resetUserFilters = () => {
    setUserSearch("");
    setUserPlan("All Plans");
  };

  const resetJobFilters = () => {
    setJobSearch("");
    setJobCity("");
    setJobStatus("all");
  };

  const resetAdFilters = () => {
    setAdSearch("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-xl">
          <h1 className="text-3xl font-black text-black mb-3">Admin Access</h1>
          <p className="text-gray-500 mb-6">Sign in with an admin account to manage users, jobs, ads, and platform reporting.</p>
          <Link href={buildAuthHref("/sign-in", { redirectTo: "/admin" })}>
            <Button className="bg-[#E50914] hover:bg-[#b40710] text-white">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-xl">
          <h1 className="text-3xl font-black text-black mb-3">Admin Only</h1>
          <p className="text-gray-500 mb-6">Your current account does not have admin access. You can still manage your own profile and postings from the dashboard.</p>
          <Link href="/dashboard">
            <Button className="bg-[#E50914] hover:bg-[#b40710] text-white">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Total Users", value: stats?.totalUsers ?? "-", sub: `${stats?.activeUsers ?? 0} active` },
    { icon: Briefcase, label: "Live Jobs", value: stats?.activeJobs ?? "-", sub: `${stats?.totalJobs ?? 0} total jobs` },
    { icon: Monitor, label: "Pending Ads", value: pendingAds, sub: `${stats?.activeAds ?? 0} active ads` },
    { icon: Headphones, label: "Support Queue", value: supportNewCount, sub: `${supportQueue?.total ?? 0} total requests` },
    { icon: TrendingUp, label: "Revenue", value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "-", sub: `${activeMemberships} active memberships` },
  ];
  const priorityQueue = [
    { label: "New support requests", value: supportNewCount, urgent: supportNewCount > 0 },
    { label: "Pending ads to review", value: pendingAds, urgent: pendingAds > 0 },
    { label: "Inactive users needing attention", value: inactiveUsers, urgent: inactiveUsers > 0 },
    { label: "Draft jobs not yet live", value: draftJobs, urgent: draftJobs > 0 },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-black text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-[#E50914]" size={24} />
            <h1 className="text-3xl font-black">Admin Dashboard</h1>
          </div>
          <p className="text-white/50">Moderate members, review postings, manage ads, and monitor platform health.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <card.icon size={18} className="text-[#E50914]" />
                <span className="text-xs text-gray-500 font-medium">{card.label}</span>
              </div>
              <p className="text-3xl font-black text-black">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_.9fr] gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-[#E50914]" />
              <h2 className="font-bold text-black">Admin Priorities</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {priorityQueue.map((item) => (
                <div key={item.label} className="rounded-xl border border-gray-100 bg-[#F5F5F5] p-4">
                  <p className={`text-2xl font-black ${item.urgent ? "text-[#E50914]" : "text-black"}`}>{item.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-[#E50914]" />
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Operations</p>
            </div>
            <h2 className="text-2xl font-black mb-3">Use this view as the platform control room.</h2>
            <p className="text-sm text-white/65 mb-5">
              Moderate users, clean up postings, approve ad placements, and keep an eye on activity without jumping between pages.
            </p>
            <p className="text-xs text-white/45">
              Recent admin activity: {activityData?.length ?? 0} event{(activityData?.length ?? 0) !== 1 ? "s" : ""} logged
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_.8fr] gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={18} className="text-[#E50914]" />
              <h2 className="font-bold text-black">Top Talent Types</h2>
            </div>
            <div className="space-y-3">
              {talentBreakdown && talentBreakdown.length > 0 ? talentBreakdown.slice(0, 8).map((item) => (
                <div key={item.talentType} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-700">{item.talentType}</span>
                  <div className="flex items-center gap-3 flex-1 max-w-xs">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E50914] rounded-full"
                        style={{ width: `${Math.min(100, (item.count / (talentBreakdown[0]?.count ?? 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-black w-7 text-right">{item.count}</span>
                  </div>
                </div>
              )) : (
                <p className="text-gray-400 text-sm">Talent breakdown will appear once users add tags.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-[#E50914]" />
              <h2 className="font-bold text-black">Operational Watchlist</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Inactive Users", value: inactiveUsers, tone: inactiveUsers > 0 ? "text-[#E50914]" : "text-black" },
                { label: "Pending Ads", value: pendingAds, tone: pendingAds > 0 ? "text-[#E50914]" : "text-black" },
                { label: "Membership Plans in Use", value: membershipDist?.length ?? 0, tone: "text-black" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`text-lg font-black ${item.tone}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6 bg-white rounded-xl p-1 border border-gray-200">
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
              <Users size={15} className="mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="jobs" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
              <Briefcase size={15} className="mr-2" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="ads" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
              <Monitor size={15} className="mr-2" />
              Ads
            </TabsTrigger>
            <TabsTrigger value="revenue" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
              <BarChart2 size={15} className="mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
              <TrendingUp size={15} className="mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="support" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
              <Headphones size={15} className="mr-2" />
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div>
                  <h2 className="font-bold text-black">Users ({usersData?.total ?? 0})</h2>
                  <p className="text-sm text-gray-500">Search members, review plan levels, and toggle account availability.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search users" className="pl-9 rounded-xl min-w-[220px]" />
                  </div>
                  <select
                    value={userPlan}
                    onChange={(e) => setUserPlan(e.target.value)}
                    className="h-10 rounded-xl border border-gray-200 px-3 text-sm bg-white"
                  >
                    {planFilterOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {loadingUsers ? (
                  <div className="p-10 text-center text-gray-400">Loading users...</div>
                ) : usersData?.users && usersData.users.length > 0 ? usersData.users.map((entry) => (
                  <div key={entry.id} className="px-5 py-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-black">{entry.firstName} {entry.lastName}</p>
                        <Badge variant="secondary" className="text-xs">{entry.role}</Badge>
                        {!entry.isActive && <Badge className="text-xs bg-red-100 text-red-700 hover:bg-red-100">Inactive</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{entry.email}</p>
                      <p className="text-xs text-gray-400 mt-1">{entry.city}, {entry.province}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {entry.planName && (
                        <Badge variant="secondary" className="text-xs">{entry.planName}</Badge>
                      )}
                      <Link href={`/talent/${entry.id}`}>
                        <Button variant="outline" size="sm" className="rounded-lg gap-2">
                          <Eye size={14} />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUser(entry.id, entry.isActive)}
                        className="rounded-lg"
                      >
                        {entry.isActive ? "Deactivate" : "Reactivate"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(entry.id)}
                        className="rounded-lg"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center">
                    <p className="text-black font-semibold mb-1">No users match the current filters</p>
                    <p className="text-sm text-gray-500 mb-4">Clear the search or plan filter to return to the full member list.</p>
                    <Button variant="outline" className="rounded-xl" onClick={resetUserFilters}>Clear User Filters</Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div>
                  <h2 className="font-bold text-black">Jobs ({jobsData?.total ?? 0})</h2>
                  <p className="text-sm text-gray-500">Moderate postings across active, draft, and expired states.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input value={jobSearch} onChange={(e) => setJobSearch(e.target.value)} placeholder="Search jobs" className="pl-9 rounded-xl min-w-[220px]" />
                  </div>
                  <Input value={jobCity} onChange={(e) => setJobCity(e.target.value)} placeholder="Filter by city" className="rounded-xl min-w-[180px]" />
                  <select
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value)}
                    className="h-10 rounded-xl border border-gray-200 px-3 text-sm bg-white"
                  >
                    <option value="all">Any Status</option>
                    {jobStatusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {loadingJobs ? (
                  <div className="p-10 text-center text-gray-400">Loading jobs...</div>
                ) : jobsData?.jobs && jobsData.jobs.length > 0 ? jobsData.jobs.map((job: JobListResponse["jobs"][number]) => (
                  <div key={job.id} className="px-5 py-4 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-black">{job.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{job.company} - {job.city}, {job.province}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{job.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{job.category}</Badge>
                      {jobStatusOptions.map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={job.status === status ? "default" : "outline"}
                          className={job.status === status ? "rounded-lg bg-black text-white hover:bg-black" : "rounded-lg"}
                          onClick={() => handleJobStatus(job.id, status)}
                        >
                          {status}
                        </Button>
                      ))}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                        className="rounded-lg"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center">
                    <p className="text-black font-semibold mb-1">No job postings match the current filters</p>
                    <p className="text-sm text-gray-500 mb-4">Reset the job search, city, or status filters to resume moderation.</p>
                    <Button variant="outline" className="rounded-xl" onClick={resetJobFilters}>Clear Job Filters</Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ads">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div>
                  <h2 className="font-bold text-black">Ads ({filteredAds.length})</h2>
                  <p className="text-sm text-gray-500">Approve placements, pause campaigns, or remove ads.</p>
                </div>
                <div className="relative w-full md:w-auto">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input value={adSearch} onChange={(e) => setAdSearch(e.target.value)} placeholder="Search ads" className="pl-9 rounded-xl min-w-[240px]" />
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {loadingAds ? (
                  <div className="p-10 text-center text-gray-400">Loading ads...</div>
                ) : filteredAds.length > 0 ? filteredAds.map((ad) => (
                  <div key={ad.id} className="px-5 py-4 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-black capitalize">{ad.placement} placement</p>
                        <Badge variant="secondary" className="text-xs">${ad.priceMonthly}/mo</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 break-all">{ad.linkUrl}</p>
                      <p className="text-xs text-gray-400 mt-1">{ad.impressions} impressions - {ad.clicks} clicks</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {adStatusOptions.map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={ad.status === status ? "default" : "outline"}
                          className={ad.status === status ? "rounded-lg bg-black text-white hover:bg-black" : "rounded-lg"}
                          onClick={() => handleAdStatus(ad.id, status)}
                        >
                          {status}
                        </Button>
                      ))}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAd(ad.id)}
                        className="rounded-lg"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center">
                    <p className="text-black font-semibold mb-1">No advertisements match the current filters</p>
                    <p className="text-sm text-gray-500 mb-4">Clear the ad search to review every placement again.</p>
                    <Button variant="outline" className="rounded-xl" onClick={resetAdFilters}>Clear Ad Search</Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="revenue">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-black text-xl mb-6">Membership Revenue</h2>
              <div className="space-y-4">
                {membershipDist && membershipDist.length > 0 ? membershipDist.map((item) => (
                  <div key={item.planName} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                    <div>
                      <p className="font-semibold text-black">{item.planName}</p>
                      <p className="text-xs text-gray-500">{item.count} active memberships</p>
                    </div>
                    <p className="text-lg font-black text-[#E50914]">${item.revenue}</p>
                  </div>
                )) : (
                  <p className="text-gray-400 text-sm">Revenue data will appear once memberships are active.</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-black">Admin Activity Log</h2>
                <p className="text-sm text-gray-500">Track admin sign-ins and moderation actions across users, jobs, and ads.</p>
              </div>
              <div className="divide-y divide-gray-100">
                {loadingActivity ? (
                  <div className="p-10 text-center text-gray-400">Loading activity...</div>
                ) : activityData && activityData.length > 0 ? activityData.map((entry) => (
                  <div key={entry.id} className="px-5 py-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-black">{entry.summary}</p>
                        <Badge variant="secondary" className="text-xs uppercase">{entry.targetType}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {entry.actorName} | {new Date(entry.createdAt).toLocaleString()}
                      </p>
                      {entry.details && Object.keys(entry.details).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(entry.details).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-[11px] rounded-full">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 uppercase tracking-[0.18em]">
                      {entry.action.replaceAll(".", " ")}
                    </p>
                  </div>
                )) : (
                  <div className="p-10 text-center">
                    <p className="text-black font-semibold mb-1">No admin activity has been logged yet</p>
                    <p className="text-sm text-gray-500">Sign-ins and moderation actions will appear here as soon as the admin team starts using the control room.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="support">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div>
                  <h2 className="font-bold text-black">Support Queue ({supportQueue?.total ?? 0})</h2>
                  <p className="text-sm text-gray-500">Review the requests that came in through the public support page.</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-[#F5F5F5] px-4 py-2 text-sm text-gray-600">
                  New requests: <span className="font-black text-[#E50914]">{supportNewCount}</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {loadingSupport ? (
                  <div className="p-10 text-center text-gray-400">Loading support queue...</div>
                ) : supportRequests.length > 0 ? supportRequests.map((entry) => (
                  <div key={entry.id} className="px-5 py-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="font-semibold text-sm text-black">{entry.name}</p>
                          <Badge variant="secondary" className="text-xs">{topicLabels.get(entry.topic) ?? entry.topic}</Badge>
                          {entry.organization && <Badge variant="outline" className="text-xs">{entry.organization}</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{entry.email} | {new Date(entry.createdAt).toLocaleString()}</p>
                        <p className="text-sm leading-7 text-gray-600 max-w-4xl">{entry.message}</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-[#F5F5F5] px-4 py-3 text-xs text-gray-500">
                        Status: <span className="font-bold uppercase tracking-[0.18em] text-black">{entry.status}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center">
                    <p className="text-black font-semibold mb-1">No support requests yet</p>
                    <p className="text-sm text-gray-500">Requests submitted from the public support page will appear here for the admin team.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
