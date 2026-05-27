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
        <div className="bg-white rounded-[1.4rem] border border-gray-100 p-5 cursor-pointer transition-all duration-300 hover:border-gray-200 h-full">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative flex-shrink-0">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt={`${firstName} ${lastName}`}
                  className="w-14 h-14 rounded-xl object-cover"
                  data-testid={`img-avatar-${id}`}
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{initials}</span>
                </div>
              )}
              {(planName === "Gold" || planName === "Gold Business" || planName === "Platinum Business") && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E50914] rounded-full flex items-center justify-center">
                  <Star size={10} className="text-white fill-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-black text-base leading-tight truncate" data-testid={`text-name-${id}`}>
                {firstName} {lastName}
              </h3>
              {jobTitle && (
                <p className="text-gray-500 text-sm truncate mt-0.5" data-testid={`text-title-${id}`}>
                  {jobTitle}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 text-xs">
                  {city}, {province}
                </span>
              </div>
            </div>
            <ArrowUpRight size={15} className="text-gray-300 flex-shrink-0" />
          </div>

          {planName && (
            <div className="mb-3">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planColors[planName] ?? "bg-gray-100 text-gray-700"}`}
                data-testid={`status-plan-${id}`}
              >
                {planName}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 min-h-11">
            {talentTags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
            {talentTags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                +{talentTags.length - 3}
              </Badge>
            )}
          </div>

          {yearsExperience !== null && yearsExperience !== undefined && (
            <div className="mt-4 border-t border-gray-100 pt-3 flex items-center justify-between">
              <p className="text-gray-400 text-xs">
                {yearsExperience} yr{yearsExperience !== 1 ? "s" : ""} experience
              </p>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-300">
                View
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
