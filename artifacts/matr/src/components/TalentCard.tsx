import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TalentCardProps {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle?: string | null;
  city: string;
  province: string;
  planName?: string | null;
  profilePhotoUrl?: string | null;
  talentTags: string[];
  yearsExperience?: number | null;
  index?: number;
}

const planColors: Record<string, string> = {
  "Platinum Business": "bg-purple-100 text-purple-800",
  "Gold Business": "bg-yellow-100 text-yellow-800",
  Gold: "bg-amber-100 text-amber-800",
  Silver: "bg-gray-100 text-gray-700",
  Bronze: "bg-orange-100 text-orange-800",
  Friend: "bg-blue-100 text-blue-800",
};

export default function TalentCard({
  id,
  firstName,
  lastName,
  jobTitle,
  city,
  province,
  planName,
  profilePhotoUrl,
  talentTags,
  yearsExperience,
  index = 0,
}: TalentCardProps) {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
    >
      <Link href={`/talent/${id}`} data-testid={`card-talent-${id}`}>
        <div className="matr-premium-card h-full cursor-pointer p-5 transition-all duration-300 hover:border-gray-200">
          <div className="relative z-10 flex items-start gap-4 mb-4">
            <div className="relative flex-shrink-0">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt={`${firstName} ${lastName}`}
                  className="h-16 w-16 rounded-[1.1rem] object-cover shadow-sm"
                  data-testid={`img-avatar-${id}`}
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.1rem] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 shadow-sm">
                  <span className="text-white font-bold text-lg">{initials}</span>
                </div>
              )}
              {(planName === "Gold" || planName === "Gold Business" || planName === "Platinum Business") && (
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E50914] shadow-[0_8px_18px_rgba(229,9,20,0.35)]">
                  <Star size={10} className="text-white fill-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full border border-gray-200 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                  Profile
                </span>
                {planName && (
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full ${planColors[planName] ?? "bg-gray-100 text-gray-700"}`}
                    data-testid={`status-plan-${id}`}
                  >
                    {planName}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-black text-lg leading-tight truncate" data-testid={`text-name-${id}`}>
                {firstName} {lastName}
              </h3>
              {jobTitle && (
                <p className="text-gray-500 text-sm truncate mt-1" data-testid={`text-title-${id}`}>
                  {jobTitle}
                </p>
              )}
              <div className="flex items-center gap-1 mt-2">
                <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 text-xs">
                  {city}, {province}
                </span>
              </div>
            </div>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white/80">
              <ArrowUpRight size={15} className="text-gray-400" />
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap gap-1.5 min-h-11">
            {talentTags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-full border border-gray-200 bg-white/85 px-2.5 py-1 text-xs text-gray-700"
              >
                {tag}
              </Badge>
            ))}
            {talentTags.length > 3 && (
              <Badge variant="secondary" className="rounded-full border border-gray-200 bg-white/85 px-2.5 py-1 text-xs text-gray-500">
                +{talentTags.length - 3}
              </Badge>
            )}
          </div>

          {yearsExperience !== null && yearsExperience !== undefined && (
            <div className="relative z-10 mt-4 flex items-center justify-between border-t border-gray-200/80 pt-3">
              <p className="text-gray-500 text-xs font-medium">
                {yearsExperience} yr{yearsExperience !== 1 ? "s" : ""} experience
              </p>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E50914]">
                Open Profile
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
