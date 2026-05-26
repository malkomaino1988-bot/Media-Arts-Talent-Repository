import { motion } from "framer-motion";
import { Users, Briefcase, Monitor, BarChart2, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useListUsers,
  useListJobs,
  useListAds,
  useGetStatsOverview,
  useGetTalentTypeBreakdown,
  useGetMembershipDistribution,
  getGetStatsOverviewQueryKey,
  getGetTalentTypeBreakdownQueryKey,
  getGetMembershipDistributionQueryKey,
  getListUsersQueryKey,
  getListJobsQueryKey,
  getListAdsQueryKey,
} from "@workspace/api-client-react";
import { useDeleteUser, useDeleteJob, useDeleteAd } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();

  const { data: stats } = useGetStatsOverview({ query: { queryKey: getGetStatsOverviewQueryKey() } });
  const { data: talentBreakdown } = useGetTalentTypeBreakdown({ query: { queryKey: getGetTalentTypeBreakdownQueryKey() } });
  const { data: membershipDist } = useGetMembershipDistribution({ query: { queryKey: getGetMembershipDistributionQueryKey() } });

  const { data: usersData } = useListUsers({}, { query: { queryKey: getListUsersQueryKey({}) } });
  const { data: jobsData } = useListJobs({}, { query: { queryKey: getListJobsQueryKey({}) } });
  const { data: adsData } = useListAds({}, { query: { queryKey: getListAdsQueryKey({}) } });

  const deleteUser = useDeleteUser();
  const deleteJob = useDeleteJob();
  const deleteAd = useDeleteAd();

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({}) });
      queryClient.invalidateQueries({ queryKey: getGetStatsOverviewQueryKey() });
      toast({ title: "User deleted" });
    } catch {
      toast({ title: "Failed to delete user", variant: "destructive" });
    }
  };

  const handleDeleteJob = async (id: number) => {
    try {
      await deleteJob.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListJobsQueryKey({}) });
      toast({ title: "Job deleted" });
    } catch {
      toast({ title: "Failed to delete job", variant: "destructive" });
    }
  };

  const handleDeleteAd = async (id: number) => {
    try {
      await deleteAd.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListAdsQueryKey({}) });
      toast({ title: "Ad deleted" });
    } catch {
      toast({ title: "Failed to delete ad", variant: "destructive" });
    }
  };

  const statCards = [
    { icon: Users, label: "Total Users", value: stats?.totalUsers ?? "—", sub: `${stats?.activeUsers ?? 0} active` },
    { icon: Briefcase, label: "Total Jobs", value: stats?.totalJobs ?? "—", sub: `${stats?.activeJobs ?? 0} active` },
    { icon: Monitor, label: "Active Ads", value: stats?.activeAds ?? "—", sub: "placements" },
    { icon: TrendingUp, label: "Total Revenue", value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "—", sub: "from memberships" },
  ];

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
          <Link href="/sign-in">
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

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-black text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black mb-1">Admin Dashboard</h1>
          <p className="text-white/50">Manage the MATR platform</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200 p-5"
              data-testid={`stat-card-${card.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <card.icon size={18} className="text-[#E50914]" />
                <span className="text-xs text-gray-500 font-medium">{card.label}</span>
              </div>
              <p className="text-3xl font-black text-black" data-testid={`stat-value-${card.label.toLowerCase().replace(/\s+/g, "-")}`}>
                {card.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </motion.div>
          ))}
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
            <TabsTrigger value="stats" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
              <BarChart2 size={15} className="mr-2" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-black">Users ({usersData?.total ?? 0})</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {usersData?.users && usersData.users.length > 0 ? usersData.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between px-5 py-3.5" data-testid={`row-user-${user.id}`}>
                    <div>
                      <p className="font-semibold text-sm text-black">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {user.planName && (
                        <Badge variant="secondary" className="text-xs" data-testid={`status-user-plan-${user.id}`}>
                          {user.planName}
                        </Badge>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="h-7 text-xs rounded-lg"
                        data-testid={`button-delete-user-${user.id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center text-gray-400">No users yet</div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-black">Job Postings ({jobsData?.total ?? 0})</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {jobsData?.jobs && jobsData.jobs.length > 0 ? jobsData.jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between px-5 py-3.5" data-testid={`row-job-${job.id}`}>
                    <div>
                      <p className="font-semibold text-sm text-black">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.company} — {job.city}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">{job.status}</Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                        className="h-7 text-xs rounded-lg"
                        data-testid={`button-delete-job-${job.id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center text-gray-400">No jobs posted yet</div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ads">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-black">Advertisements</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {adsData && adsData.length > 0 ? adsData.map((ad) => (
                  <div key={ad.id} className="flex items-center justify-between px-5 py-3.5" data-testid={`row-ad-${ad.id}`}>
                    <div>
                      <p className="font-semibold text-sm text-black capitalize">{ad.placement} Placement</p>
                      <p className="text-xs text-gray-500">
                        {ad.impressions} impressions · {ad.clicks} clicks
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">{ad.status}</Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAd(ad.id)}
                        className="h-7 text-xs rounded-lg"
                        data-testid={`button-delete-ad-${ad.id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center text-gray-400">No ads yet</div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-black mb-4">Top Talent Types</h3>
                <div className="space-y-3">
                  {talentBreakdown && talentBreakdown.length > 0 ? talentBreakdown.slice(0, 8).map((item) => (
                    <div key={item.talentType} className="flex items-center justify-between" data-testid={`stat-talent-${item.talentType}`}>
                      <span className="text-sm text-gray-700">{item.talentType}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E50914] rounded-full"
                            style={{ width: `${Math.min(100, (item.count / (talentBreakdown[0]?.count ?? 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-black w-6 text-right">{item.count}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-400 text-sm">No data yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-black mb-4">Membership Distribution</h3>
                <div className="space-y-3">
                  {membershipDist && membershipDist.length > 0 ? membershipDist.map((item) => (
                    <div key={item.planName} className="flex items-center justify-between" data-testid={`stat-membership-${item.planName}`}>
                      <span className="text-sm text-gray-700">{item.planName}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400">{item.count} users</span>
                        <span className="text-sm font-bold text-[#E50914]">${item.revenue}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-400 text-sm">No memberships yet</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
