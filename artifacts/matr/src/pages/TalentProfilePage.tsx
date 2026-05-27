import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Globe, Instagram, Twitter, Linkedin, ArrowLeft, Star, Mail, Briefcase, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetTalent, getGetTalentQueryKey } from "@workspace/api-client-react";

const planColors: Record<string, string> = {
  "Platinum Business": "bg-purple-100 text-purple-800",
  "Gold Business": "bg-yellow-100 text-yellow-800",
  Gold: "bg-amber-100 text-amber-800",
  Silver: "bg-gray-100 text-gray-700",
  Bronze: "bg-orange-100 text-orange-800",
  Friend: "bg-blue-100 text-blue-800",
};

export default function TalentProfilePage() {
  const [match, params] = useRoute("/talent/:id");
  const id = match ? Number(params?.id) : 0;

  const { data: talent, isLoading } = useGetTalent(id, {
    query: { enabled: !!id, queryKey: getGetTalentQueryKey(id) },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="h-48 bg-gray-200 animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 -mt-16">
          <div className="w-32 h-32 rounded-2xl bg-gray-300 animate-pulse mb-4" />
          <div className="h-8 bg-gray-200 rounded-xl w-64 animate-pulse mb-2" />
          <div className="h-5 bg-gray-200 rounded-xl w-40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-xl rounded-[2rem] border border-gray-200 bg-[#F5F5F5] p-10 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-[#E50914] mb-3">Profile Unavailable</p>
          <h1 className="text-4xl font-black text-black mb-4">Talent Not Found</h1>
          <p className="text-gray-500 mb-6">
            This profile may have been removed or the link may be outdated. Keep moving by returning to the directory or opening current opportunities.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/explore">
              <Button className="bg-[#E50914] hover:bg-[#b40710] text-white">Back to Explore</Button>
            </Link>
            <Link href="/jobs">
              <Button variant="outline">Browse Jobs</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = `${talent.firstName[0] ?? ""}${talent.lastName[0] ?? ""}`.toUpperCase();
  const isPriority = talent.planName === "Gold" || talent.planName === "Gold Business" || talent.planName === "Platinum Business";
  const hasContactLinks = Boolean(talent.website || talent.instagram || talent.twitter || talent.linkedin);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div
        className="h-56 md:h-72 relative"
        style={{
          background: talent.bannerUrl
            ? `url(${talent.bannerUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, #222222 0%, #111111 50%, #E50914 100%)",
        }}
        data-testid="img-banner"
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 md:-mt-20 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative flex-shrink-0"
            >
              {talent.profilePhotoUrl ? (
                <img
                  src={talent.profilePhotoUrl}
                  alt={`${talent.firstName} ${talent.lastName}`}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-white shadow-lg"
                  data-testid="img-profile-photo"
                />
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white font-black text-4xl">{initials}</span>
                </div>
              )}
              {isPriority && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#E50914] rounded-full flex items-center justify-center shadow-md">
                  <Star size={14} className="text-white fill-white" />
                </div>
              )}
            </motion.div>

            <div className="flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-black text-black" data-testid="text-talent-name">
                  {talent.firstName} {talent.lastName}
                </h1>
                {talent.planName && (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${planColors[talent.planName] ?? "bg-gray-100 text-gray-700"}`}
                    data-testid="status-talent-plan"
                  >
                    {talent.planName}
                  </span>
                )}
              </div>
              {talent.jobTitle && (
                <p className="text-gray-600 text-lg font-medium mb-2" data-testid="text-talent-title">
                  {talent.jobTitle}
                </p>
              )}
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-gray-500 text-sm" data-testid="text-talent-location">
                  {talent.city}, {talent.province}, {talent.country}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-16">
          <div className="lg:col-span-2 space-y-6">
            {talent.bio && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-black text-lg mb-3">About</h2>
                <p className="text-gray-600 leading-relaxed" data-testid="text-talent-bio">{talent.bio}</p>
              </div>
            )}

            {talent.talentTags.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-black text-lg mb-4">Talent & Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {talent.talentTags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-black text-white rounded-full px-3 py-1 text-sm font-medium"
                      data-testid={`tag-talent-${tag}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-bold text-black text-lg">Portfolio</h2>
                {talent.media && talent.media.length > 0 && (
                  <span className="text-xs uppercase tracking-[0.2em] text-gray-400">
                    {talent.media.length} item{talent.media.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {talent.media && talent.media.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {talent.media.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="aspect-square rounded-xl overflow-hidden bg-gray-100"
                      data-testid={`media-item-${item.id}`}
                    >
                      {item.mediaType === "image" ? (
                        <img
                          src={item.url}
                          alt={item.title ?? "Portfolio"}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                          <span className="text-xs font-medium uppercase">{item.mediaType}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6">
                  <p className="text-black font-semibold mb-1">Portfolio updates coming soon</p>
                  <p className="text-sm text-gray-500 mb-4">
                    This profile is active in the directory, but media samples have not been added yet.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/explore">
                      <Button variant="outline" className="rounded-xl">Discover More Talent</Button>
                    </Link>
                    <Link href="/jobs">
                      <Button className="rounded-xl bg-[#E50914] hover:bg-[#b40710] text-white">Browse Jobs</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-black mb-4">Quick Info</h3>
              <dl className="space-y-3">
                {talent.yearsExperience !== null && talent.yearsExperience !== undefined && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wider">Experience</dt>
                    <dd className="text-black font-semibold" data-testid="text-years-experience">
                      {talent.yearsExperience} year{talent.yearsExperience !== 1 ? "s" : ""}
                    </dd>
                  </div>
                )}
                {talent.gender && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wider">Gender</dt>
                    <dd className="text-black font-semibold" data-testid="text-gender">{talent.gender}</dd>
                  </div>
                )}
                {talent.age && (
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wider">Age</dt>
                    <dd className="text-black font-semibold" data-testid="text-age">{talent.age}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-black mb-4">Connect</h3>
              <div className="space-y-2">
                {talent.website && (
                  <a href={talent.website} target="_blank" rel="noopener noreferrer" data-testid="link-website">
                    <div className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors py-1">
                      <Globe size={15} className="text-gray-400" />
                      <span className="text-sm truncate">Website</span>
                    </div>
                  </a>
                )}
                {talent.instagram && (
                  <a href={`https://instagram.com/${talent.instagram}`} target="_blank" rel="noopener noreferrer" data-testid="link-instagram">
                    <div className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors py-1">
                      <Instagram size={15} className="text-gray-400" />
                      <span className="text-sm">@{talent.instagram}</span>
                    </div>
                  </a>
                )}
                {talent.twitter && (
                  <a href={`https://twitter.com/${talent.twitter}`} target="_blank" rel="noopener noreferrer" data-testid="link-twitter">
                    <div className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors py-1">
                      <Twitter size={15} className="text-gray-400" />
                      <span className="text-sm">@{talent.twitter}</span>
                    </div>
                  </a>
                )}
                {talent.linkedin && (
                  <a href={talent.linkedin} target="_blank" rel="noopener noreferrer" data-testid="link-linkedin">
                    <div className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors py-1">
                      <Linkedin size={15} className="text-gray-400" />
                      <span className="text-sm">LinkedIn</span>
                    </div>
                  </a>
                )}
                {!hasContactLinks && (
                  <p className="text-sm text-gray-500">
                    Public social links have not been added yet. Use the job board or directory to keep moving.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-black rounded-2xl p-5 text-white">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45 mb-2">Next Step</p>
              <h3 className="font-black text-xl mb-2">Ready to work together?</h3>
              <p className="text-sm text-white/65 mb-5">
                Use MATR to post a role, review more profiles, or compare current opportunities before you reach out.
              </p>
              <div className="space-y-2">
                <Link href="/post-job">
                  <Button className="w-full rounded-xl bg-[#E50914] hover:bg-[#b40710] text-white gap-2">
                    <Briefcase size={15} />
                    Post a Job
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button variant="outline" className="w-full rounded-xl border-white/15 bg-transparent text-white hover:bg-white/10 gap-2">
                    <Mail size={15} />
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button variant="outline" className="w-full rounded-xl border-white/15 bg-transparent text-white hover:bg-white/10 gap-2">
                    <Compass size={15} />
                    Discover More Talent
                  </Button>
                </Link>
              </div>
            </div>

            <Link href="/explore">
              <Button
                variant="outline"
                className="w-full rounded-xl border-gray-200 gap-2"
                data-testid="button-back-explore"
              >
                <ArrowLeft size={16} />
                Back to Explore
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
