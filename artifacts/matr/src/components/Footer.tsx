import { Link } from "wouter";
import { ArrowUpRight, Briefcase, Megaphone, Users } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="matr-grid matr-ring relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 md:p-8 mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="absolute inset-y-0 right-0 hidden w-80 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.2),transparent_70%)] lg:block" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-2">Creative Network</p>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              Make every next step obvious.
            </h3>
            <p className="text-sm text-gray-400 max-w-2xl">
              Explore talent, post a role, promote a project, or upgrade a membership without hitting a dead end.
            </p>
          </div>
          <div className="relative grid gap-3 sm:grid-cols-3">
            <Link href="/explore">
              <span className="inline-flex h-14 min-w-[170px] items-center justify-between rounded-2xl bg-[#E50914] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#b40710] cursor-pointer">
                <span className="flex items-center gap-2">
                  <Users size={16} />
                  Browse Talent
                </span>
                <ArrowUpRight size={14} />
              </span>
            </Link>
            <Link href="/jobs">
              <span className="inline-flex h-14 min-w-[170px] items-center justify-between rounded-2xl border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/5 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Briefcase size={16} />
                  Browse Jobs
                </span>
                <ArrowUpRight size={14} />
              </span>
            </Link>
            <Link href="/advertise">
              <span className="inline-flex h-14 min-w-[170px] items-center justify-between rounded-2xl border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/5 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Megaphone size={16} />
                  Advertise
                </span>
                <ArrowUpRight size={14} />
              </span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#E50914] rounded-sm flex items-center justify-center">
                <span className="text-white font-black text-sm">M</span>
              </div>
              <span className="font-black text-white text-lg tracking-tight">MATR</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Media Arts Talent Repository - a creative directory for talent, production teams, and local hiring.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">
              Discover
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/explore", label: "Explore Talent" },
                { href: "/jobs", label: "Job Board" },
                { href: "/membership", label: "Membership Plans" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">
              For Business
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/post-job", label: "Post a Job" },
                { href: "/advertise", label: "Advertise" },
                { href: "/membership", label: "Business Plans" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">
              Account
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/sign-up", label: "Join the Directory" },
                { href: "/sign-in", label: "Sign In" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/admin", label: "Admin Portal" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Media Arts Talent Repository. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Windsor, Ontario, Canada
          </p>
        </div>
      </div>
    </footer>
  );
}
