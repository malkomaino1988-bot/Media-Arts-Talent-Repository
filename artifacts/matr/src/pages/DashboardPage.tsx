import { useState } from "react";
import { Link } from "wouter";
import {
  User,
  Image,
  BarChart2,
  CheckCircle2,
  Edit2,
  Plus,
  Sparkles,
  Trash2,
  Briefcase,
  Monitor,
  ExternalLink,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useUpdateUser,
  useGetUserMedia,
  useDeleteMedia,
  useUploadMedia,
  useListJobs,
  useListAds,
  useGetUserMembership,
  getGetUserQueryKey,
  getGetUserMediaQueryKey,
  getListJobsQueryKey,
  getListAdsQueryKey,
  getGetUserMembershipQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { buildAuthHref } from "@/lib/auth-routes";

const TALENT_TAGS = [
  "Photography",
  "Film & Video",
  "Music",
  "Graphic Design",
  "Voice Acting",
  "Acting & Performance",
  "Modeling",
  "Production",
  "Sound Engineering",
  "Animation",
  "Writing & Content",
  "DJ & Events",
  "Makeup & Beauty",
  "Art Direction",
  "Editing",
  "Illustration",
];

type MediaType = "image" | "video" | "audio" | "document";

export default function DashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const userId = user?.id ?? 0;
  const successState = searchParams.get("success");

  const { data: media, isLoading: loadingMedia } = useGetUserMedia(userId, {
    query: { enabled: !!userId, queryKey: getGetUserMediaQueryKey(userId) },
  });
  const { data: jobsData } = useListJobs({}, { query: { queryKey: getListJobsQueryKey({}) } });
  const { data: adsData } = useListAds({}, { query: { queryKey: getListAdsQueryKey({}) } });
  const { data: membership } = useGetUserMembership(userId, {
    query: { enabled: !!userId, queryKey: getGetUserMembershipQueryKey(userId) },
  });

  const updateUser = useUpdateUser();
  const deleteMedia = useDeleteMedia();
  const uploadMedia = useUploadMedia();

  const [editing, setEditing] = useState(false);
  const [newMedia, setNewMedia] = useState<{ title: string; url: string; mediaType: MediaType }>({
    title: "",
    url: "",
    mediaType: "image",
  });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    jobTitle: "",
    city: "Windsor",
    province: "ON",
    website: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    profilePhotoUrl: "",
    bannerUrl: "",
    yearsExperience: "",
    age: "",
    gender: "",
    talentTags: [] as string[],
  });

  const userJobs = jobsData?.jobs.filter((job) => job.userId === userId) ?? [];
  const userAds = adsData?.filter((ad) => ad.userId === userId) ?? [];
  const completionParts = user
    ? [
        user.bio,
        user.jobTitle,
        user.website,
        user.profilePhotoUrl,
        user.bannerUrl,
        user.yearsExperience !== null && user.yearsExperience !== undefined ? "experience" : "",
        user.talentTags.length > 0 ? "tags" : "",
      ].filter(Boolean).length
    : 0;
  const profileCompleteness = Math.min(100, completionParts * 14);
  const profileChecklist = [
    { label: "Add a clear bio", done: Boolean(user?.bio) },
    { label: "Set your public role", done: Boolean(user?.jobTitle) },
    { label: "Add profile or banner imagery", done: Boolean(user?.profilePhotoUrl || user?.bannerUrl) },
    { label: "Add your contact links", done: Boolean(user?.website || user?.instagram || user?.linkedin || user?.twitter) },
    { label: "Choose talent tags", done: Boolean(user?.talentTags.length) },
  ];
  const successConfig = successState === "job-posted"
    ? {
        title: "Job posted successfully",
        description: "Your listing is now attached to your account. Review it, then open the public board to see how it appears to applicants.",
        primaryHref: "/jobs",
        primaryLabel: "Review the Job Board",
        secondaryHref: "/post-job",
        secondaryLabel: "Post Another Role",
      }
    : successState === "ad-created"
      ? {
          title: "Ad placement created",
          description: "Your campaign is attached to this account. Review your dashboard, then create another placement if you need more visibility.",
          primaryHref: "/advertise",
          primaryLabel: "Create Another Placement",
          secondaryHref: "/membership",
          secondaryLabel: "Strengthen Brand Presence",
        }
      : successState?.startsWith("membership-")
        ? {
            title: "Membership activated",
            description: "Your plan is live. Finish the strongest version of your profile now so the upgrade turns into visibility and action.",
            primaryHref: `/talent/${userId}`,
            primaryLabel: "Preview Public Profile",
            secondaryHref: "/membership",
            secondaryLabel: "Review Membership",
          }
        : null;

  const startEdit = () => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio ?? "",
        jobTitle: user.jobTitle ?? "",
        city: user.city,
        province: user.province,
        website: user.website ?? "",
        instagram: user.instagram ?? "",
        twitter: user.twitter ?? "",
        linkedin: user.linkedin ?? "",
        profilePhotoUrl: user.profilePhotoUrl ?? "",
        bannerUrl: user.bannerUrl ?? "",
        yearsExperience: user.yearsExperience?.toString() ?? "",
        age: user.age?.toString() ?? "",
        gender: user.gender ?? "",
        talentTags: user.talentTags,
      });
    }
    setEditing(true);
  };

  const toggleTalentTag = (tag: string) => {
    setForm((current) => ({
      ...current,
      talentTags: current.talentTags.includes(tag)
        ? current.talentTags.filter((item) => item !== tag)
        : [...current.talentTags, tag],
    }));
  };

  const saveProfile = async () => {
    try {
      await updateUser.mutateAsync({
        id: userId,
        data: {
          firstName: form.firstName,
          lastName: form.lastName,
          bio: form.bio || null,
          jobTitle: form.jobTitle || null,
          city: form.city,
          province: form.province,
          website: form.website || null,
          instagram: form.instagram || null,
          twitter: form.twitter || null,
          linkedin: form.linkedin || null,
          profilePhotoUrl: form.profilePhotoUrl || null,
          bannerUrl: form.bannerUrl || null,
          gender: form.gender || null,
          age: form.age ? Number(form.age) : null,
          yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
          talentTags: form.talentTags,
        },
      });
      queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(userId) });
      await refreshUser();
      toast({ title: "Profile updated" });
      setEditing(false);
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  const handleDeleteMedia = async (id: number) => {
    try {
      await deleteMedia.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetUserMediaQueryKey(userId) });
      toast({ title: "Media deleted" });
    } catch {
      toast({ title: "Failed to delete media", variant: "destructive" });
    }
  };

  const handleAddMedia = async () => {
    if (!newMedia.url) {
      toast({ title: "Please provide a media URL", variant: "destructive" });
      return;
    }

    try {
      await uploadMedia.mutateAsync({
        data: {
          userId,
          url: newMedia.url,
          title: newMedia.title || null,
          mediaType: newMedia.mediaType,
        },
      });
      queryClient.invalidateQueries({ queryKey: getGetUserMediaQueryKey(userId) });
      setNewMedia({ title: "", url: "", mediaType: "image" });
      toast({ title: "Media added" });
    } catch {
      toast({ title: "Failed to add media", variant: "destructive" });
    }
  };

  const resetSuccessState = () => {
    if (typeof window === "undefined" || !successState) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.delete("success");
    const nextSearch = params.toString();
    const nextUrl = nextSearch ? `${window.location.pathname}?${nextSearch}` : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-black text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <h1 className="text-3xl font-black mb-2">Dashboard</h1>
              <p className="text-white/50 max-w-2xl">
                Manage your public profile, upload portfolio media, and keep your jobs, ads, and membership moving.
              </p>
            </div>
            {user && (
              <div className="flex flex-wrap gap-3">
                <Link href={`/talent/${user.id}`}>
                  <Button variant="outline" className="rounded-xl border-white/15 bg-transparent text-white hover:bg-white/10 gap-2">
                    <ExternalLink size={15} />
                    View Public Profile
                  </Button>
                </Link>
                <Link href="/membership">
                  <Button className="rounded-xl bg-[#E50914] hover:bg-[#b40710] text-white">
                    Manage Membership
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-gray-500 mb-6">Please sign in or create an account to access your dashboard.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href={buildAuthHref("/sign-in", { redirectTo: "/dashboard" })}>
                <Button className="bg-[#E50914] hover:bg-[#b40710] text-white font-semibold rounded-xl">
                  Sign In
                </Button>
              </Link>
              <Link href={buildAuthHref("/sign-up", { redirectTo: "/dashboard" })}>
                <Button variant="outline" className="rounded-xl">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {successConfig && (
              <div className="mb-6 rounded-[1.8rem] border border-[#E50914]/15 bg-white p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#E50914] mb-2">Success</p>
                    <h2 className="text-2xl font-black text-black mb-2">{successConfig.title}</h2>
                    <p className="max-w-2xl text-sm text-gray-500">{successConfig.description}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href={successConfig.primaryHref}>
                      <Button className="rounded-xl bg-[#E50914] text-white hover:bg-[#b40710] gap-2">
                        {successConfig.primaryLabel}
                        <ArrowRight size={15} />
                      </Button>
                    </Link>
                    <Link href={successConfig.secondaryHref}>
                      <Button variant="outline" className="rounded-xl">
                        {successConfig.secondaryLabel}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Profile Completion", value: `${profileCompleteness}%`, icon: User, sub: "Public profile readiness" },
                { label: "Media Items", value: String(media?.length ?? 0), icon: Image, sub: "Portfolio assets online" },
                { label: "Active Jobs", value: String(userJobs.length), icon: Briefcase, sub: "Listings tied to your account" },
                { label: "Ad Placements", value: String(userAds.length), icon: Monitor, sub: "Campaigns you can monitor" },
              ].map((card) => (
                <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <card.icon size={16} className="text-[#E50914]" />
                    <span className="text-xs text-gray-500 font-medium">{card.label}</span>
                  </div>
                  <p className="text-3xl font-black text-black">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_.7fr] gap-6 mb-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-1">Profile Strength</p>
                    <h2 className="text-xl font-black text-black">Keep your public profile current</h2>
                  </div>
                  <span className="text-2xl font-black text-[#E50914]">{profileCompleteness}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-4">
                  <div className="h-full bg-[#E50914]" style={{ width: `${profileCompleteness}%` }} />
                </div>
                <p className="text-sm text-gray-500">
                  Add bio, role, links, media, and talent tags so hiring teams can understand your work at a glance.
                </p>
              </div>

              <div className="bg-black rounded-2xl p-6 text-white">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45 mb-2">Membership</p>
                <h2 className="text-2xl font-black mb-2">{membership?.planName ?? user.planName ?? "No Active Plan"}</h2>
                <p className="text-sm text-white/60 mb-5">
                  {membership?.expiresAt
                    ? `Renews through ${new Date(membership.expiresAt).toLocaleDateString()}`
                    : "Choose a plan to unlock more visibility and membership benefits."}
                </p>
                <Link href="/membership">
                  <Button className="w-full rounded-xl bg-[#E50914] hover:bg-[#b40710] text-white">
                    View Plans
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_.9fr] gap-6 mb-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-[#E50914]" />
                  <h2 className="text-xl font-black text-black">Current Focus</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {profileChecklist.map((item) => (
                    <div key={item.label} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[#F5F5F5] px-4 py-3">
                      <CheckCircle2 size={18} className={item.done ? "text-[#E50914] mt-0.5" : "text-gray-300 mt-0.5"} />
                      <div>
                        <p className="text-sm font-semibold text-black">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.done ? "Completed" : "Recommended next step"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black rounded-2xl p-6 text-white">
                <p className="text-xs uppercase tracking-[0.22em] text-white/45 mb-2">Member Control Center</p>
                <h2 className="text-2xl font-black mb-3">Keep your public profile, media, jobs, and ads aligned.</h2>
                <p className="text-sm text-white/65 mb-5">
                  The stronger your profile looks here, the easier it is for people to trust what they see when they open the public directory listing.
                </p>
                <div className="space-y-2">
                  <Link href="/post-job">
                    <Button className="w-full rounded-xl bg-[#E50914] hover:bg-[#b40710] text-white">Post a Job</Button>
                  </Link>
                  <Link href="/advertise">
                    <Button variant="outline" className="w-full rounded-xl border-white/15 bg-transparent text-white hover:bg-white/10">Create an Ad</Button>
                  </Link>
                </div>
              </div>
            </div>

            <Tabs defaultValue="profile">
              <TabsList className="mb-6 bg-white rounded-xl p-1 border border-gray-200">
                <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
                  <User size={15} className="mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="media" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
                  <Image size={15} className="mr-2" />
                  Media
                </TabsTrigger>
                <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
                  <BarChart2 size={15} className="mr-2" />
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_.9fr] gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <h2 className="font-bold text-black text-xl">Your Profile</h2>
                      {!editing ? (
                        <Button onClick={startEdit} variant="outline" className="rounded-xl gap-2" data-testid="button-edit-profile">
                          <Edit2 size={15} />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setEditing(false)} className="rounded-xl" data-testid="button-cancel-edit">
                            Cancel
                          </Button>
                          <Button
                            onClick={saveProfile}
                            disabled={updateUser.isPending}
                            className="bg-[#E50914] hover:bg-[#b40710] text-white rounded-xl"
                            data-testid="button-save-profile"
                          >
                            {updateUser.isPending ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      )}
                    </div>

                    {editing ? (
                      <div className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-semibold">First Name</Label>
                            <Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className="mt-1 rounded-xl" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">Last Name</Label>
                            <Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className="mt-1 rounded-xl" />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-semibold">Job Title</Label>
                            <Input value={form.jobTitle} onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))} className="mt-1 rounded-xl" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">Years of Experience</Label>
                            <Input value={form.yearsExperience} onChange={(e) => setForm((f) => ({ ...f, yearsExperience: e.target.value }))} className="mt-1 rounded-xl" />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-semibold">Bio</Label>
                          <Textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} className="mt-1 rounded-xl min-h-[110px]" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-semibold">City</Label>
                            <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="mt-1 rounded-xl" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">Province</Label>
                            <Input value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))} className="mt-1 rounded-xl" />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-semibold">Gender</Label>
                            <Input value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className="mt-1 rounded-xl" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">Age</Label>
                            <Input value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} className="mt-1 rounded-xl" />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-semibold">Website</Label>
                            <Input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} className="mt-1 rounded-xl" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">Instagram</Label>
                            <Input value={form.instagram} onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))} className="mt-1 rounded-xl" placeholder="username" />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-semibold">Twitter / X</Label>
                            <Input value={form.twitter} onChange={(e) => setForm((f) => ({ ...f, twitter: e.target.value }))} className="mt-1 rounded-xl" placeholder="username" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">LinkedIn URL</Label>
                            <Input value={form.linkedin} onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))} className="mt-1 rounded-xl" />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-semibold">Profile Photo URL</Label>
                            <Input value={form.profilePhotoUrl} onChange={(e) => setForm((f) => ({ ...f, profilePhotoUrl: e.target.value }))} className="mt-1 rounded-xl" />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">Banner URL</Label>
                            <Input value={form.bannerUrl} onChange={(e) => setForm((f) => ({ ...f, bannerUrl: e.target.value }))} className="mt-1 rounded-xl" />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-semibold">Talent Tags</Label>
                          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2 mt-2">
                            {TALENT_TAGS.map((tag) => {
                              const selected = form.talentTags.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => toggleTalentTag(tag)}
                                  className={selected
                                    ? "rounded-xl border border-black bg-black px-3 py-2 text-left text-sm text-white"
                                    : "rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-600 hover:border-gray-300"}
                                >
                                  {tag}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <p className="text-2xl font-black text-black">{user.firstName} {user.lastName}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {user.jobTitle && <Badge className="bg-black text-white">{user.jobTitle}</Badge>}
                            {user.planName && <Badge variant="secondary">{user.planName}</Badge>}
                          </div>
                        </div>

                        {user.bio && (
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-2">About</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{user.bio}</p>
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-gray-100 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-2">Location</p>
                            <p className="font-semibold text-black flex items-center gap-2">
                              <MapPin size={14} className="text-[#E50914]" />
                              {user.city}, {user.province}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-gray-100 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-2">Experience</p>
                            <p className="font-semibold text-black">
                              {user.yearsExperience !== null && user.yearsExperience !== undefined
                                ? `${user.yearsExperience} year${user.yearsExperience !== 1 ? "s" : ""}`
                                : "Not set yet"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-2">Talent Tags</p>
                          {user.talentTags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {user.talentTags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="rounded-full">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Add talent tags to improve discovery in search.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h3 className="font-bold text-black mb-4">Profile Assets</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-1">Profile Photo</p>
                          <p className="text-sm text-gray-600 break-all">{user.profilePhotoUrl ?? "Not added yet"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-1">Banner Image</p>
                          <p className="text-sm text-gray-600 break-all">{user.bannerUrl ?? "Not added yet"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h3 className="font-bold text-black mb-4">Online Presence</h3>
                      <div className="space-y-3 text-sm text-gray-600">
                        <p><span className="font-semibold text-black">Website:</span> {user.website ?? "Not added yet"}</p>
                        <p><span className="font-semibold text-black">Instagram:</span> {user.instagram ? `@${user.instagram}` : "Not added yet"}</p>
                        <p><span className="font-semibold text-black">Twitter / X:</span> {user.twitter ? `@${user.twitter}` : "Not added yet"}</p>
                        <p><span className="font-semibold text-black">LinkedIn:</span> {user.linkedin ?? "Not added yet"}</p>
                      </div>
                    </div>

                    <div className="bg-black rounded-2xl p-6 text-white">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45 mb-2">Next Move</p>
                      <h3 className="text-xl font-black mb-2">Use your profile to drive action</h3>
                      <p className="text-sm text-white/65 mb-5">
                        Publish the strongest version of your profile, then direct people into your jobs, ads, and media.
                      </p>
                      <div className="space-y-2">
                        <Link href="/jobs">
                          <Button variant="outline" className="w-full rounded-xl border-white/15 bg-transparent text-white hover:bg-white/10">
                            Browse Jobs
                          </Button>
                        </Link>
                        <Link href="/advertise">
                          <Button variant="outline" className="w-full rounded-xl border-white/15 bg-transparent text-white hover:bg-white/10">
                            Create an Ad
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="font-bold text-black text-xl">Media Gallery</h2>
                      <p className="text-sm text-gray-500">Add image, video, audio, or document links to support your public profile.</p>
                    </div>
                    <Link href={`/talent/${user.id}`}>
                      <Button variant="outline" className="rounded-xl gap-2">
                        <ExternalLink size={15} />
                        Preview Profile
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr_.75fr_auto] gap-3 mb-6">
                    <Input
                      value={newMedia.title}
                      onChange={(e) => setNewMedia((current) => ({ ...current, title: e.target.value }))}
                      placeholder="Title (optional)"
                      className="rounded-xl"
                    />
                    <Input
                      value={newMedia.url}
                      onChange={(e) => setNewMedia((current) => ({ ...current, url: e.target.value }))}
                      placeholder="https://your-media-url"
                      className="rounded-xl"
                    />
                    <Select value={newMedia.mediaType} onValueChange={(value) => setNewMedia((current) => ({ ...current, mediaType: value as MediaType }))}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Media Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddMedia} disabled={uploadMedia.isPending} className="bg-black hover:bg-gray-800 text-white rounded-xl gap-2" data-testid="button-add-media">
                      <Plus size={15} />
                      Add
                    </Button>
                  </div>

                  {loadingMedia ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : media && media.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {media.map((item) => (
                        <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group" data-testid={`media-item-${item.id}`}>
                          {item.mediaType === "image" ? (
                            <img src={item.url} alt={item.title ?? ""} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white p-4 text-center">
                              <p className="text-xs uppercase tracking-[0.18em] text-white/45 mb-2">{item.mediaType}</p>
                              <p className="text-sm font-semibold">{item.title ?? "Media Link"}</p>
                            </div>
                          )}
                          <button
                            onClick={() => handleDeleteMedia(item.id)}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            data-testid={`button-delete-media-${item.id}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                      <Image size={32} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-black font-semibold mb-1">No media uploaded yet</p>
                      <p className="text-gray-400 text-sm mb-4">Add links to stills, reels, playlists, or documents so your profile is ready to be reviewed.</p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button variant="outline" className="rounded-xl" onClick={startEdit}>
                          Update Profile First
                        </Button>
                        <Link href={`/talent/${user.id}`}>
                          <Button className="rounded-xl bg-[#E50914] hover:bg-[#b40710] text-white">
                            Preview Public Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <div className="grid grid-cols-1 xl:grid-cols-[.9fr_1.1fr] gap-6">
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h2 className="font-bold text-black text-xl mb-6">Account Snapshot</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "Membership", value: membership?.planName ?? user.planName ?? "None" },
                          { label: "Expires", value: membership?.expiresAt ? new Date(membership.expiresAt).toLocaleDateString() : "-" },
                          { label: "Jobs Posted", value: String(userJobs.length) },
                          { label: "Ads Running", value: String(userAds.length) },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-[#F5F5F5] rounded-xl p-4">
                            <p className="text-lg font-black text-black break-words">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black rounded-2xl p-6 text-white">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45 mb-2">Action Center</p>
                      <h3 className="text-xl font-black mb-4">Keep your account moving</h3>
                      <div className="space-y-2">
                        <Link href="/post-job">
                          <Button className="w-full rounded-xl bg-[#E50914] hover:bg-[#b40710] text-white">Post a Job</Button>
                        </Link>
                        <Link href="/advertise">
                          <Button variant="outline" className="w-full rounded-xl border-white/15 bg-transparent text-white hover:bg-white/10">Create an Ad</Button>
                        </Link>
                        <Link href="/explore">
                          <Button variant="outline" className="w-full rounded-xl border-white/15 bg-transparent text-white hover:bg-white/10">Discover Talent</Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <h3 className="font-bold text-black">Your Jobs</h3>
                        <Link href="/post-job">
                          <Button variant="outline" className="rounded-xl">Post Another</Button>
                        </Link>
                      </div>
                      {userJobs.length > 0 ? (
                        <div className="space-y-3">
                          {userJobs.slice(0, 4).map((job) => (
                            <div key={job.id} className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-4">
                              <div>
                                <p className="font-medium text-sm text-black">{job.title}</p>
                                <p className="text-xs text-gray-500">{job.city}, {job.province}</p>
                              </div>
                              <Badge variant="secondary">{job.category}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-[#F5F5F5] p-5">
                          <p className="text-sm font-semibold text-black mb-1">No job postings yet</p>
                          <p className="text-sm text-gray-500 mb-4">Create your first listing when you need cast, crew, or collaborators.</p>
                          <div className="flex flex-wrap gap-3">
                            <Link href="/post-job">
                              <Button className="rounded-xl bg-[#E50914] hover:bg-[#b40710] text-white">
                                Post Your First Job
                              </Button>
                            </Link>
                            <Link href="/jobs">
                              <Button variant="outline" className="rounded-xl">
                                Browse the Job Board
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <h3 className="font-bold text-black">Your Ads</h3>
                        <Link href="/advertise">
                          <Button variant="outline" className="rounded-xl">Create Placement</Button>
                        </Link>
                      </div>
                      {userAds.length > 0 ? (
                        <div className="space-y-3">
                          {userAds.slice(0, 4).map((ad) => (
                            <div key={ad.id} className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-4">
                              <div>
                                <p className="font-medium text-sm text-black capitalize">{ad.placement}</p>
                                <p className="text-xs text-gray-500">{ad.status}</p>
                              </div>
                              <Badge className="bg-black text-white">${ad.priceMonthly}/mo</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-[#F5F5F5] p-5">
                          <p className="text-sm font-semibold text-black mb-1">No ad placements yet</p>
                          <p className="text-sm text-gray-500 mb-4">Launch a placement when you want to promote your brand, project, or service inside the directory.</p>
                          <div className="flex flex-wrap gap-3">
                            <Link href="/advertise">
                              <Button className="rounded-xl bg-[#E50914] hover:bg-[#b40710] text-white">
                                Create a Placement
                              </Button>
                            </Link>
                            <Link href="/membership">
                              <Button variant="outline" className="rounded-xl">
                                Review Promotion Options
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            {successConfig && (
              <div className="mt-6 flex justify-end">
                <Button variant="ghost" className="rounded-xl text-gray-500 hover:text-black" onClick={resetSuccessState}>
                  Dismiss success message
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
