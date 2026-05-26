import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-2">Creative Network</p>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              Keep every path in the directory working.
            </h3>
            <p className="text-sm text-gray-400 max-w-2xl">
              Discover talent, post a role, promote your brand, or manage your membership without hunting for the next step.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/explore">
              <span className="inline-flex h-11 items-center rounded-xl bg-[#E50914] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#b40710] cursor-pointer">
                Browse Talent
              </span>
            </Link>
            <Link href="/jobs">
              <span className="inline-flex h-11 items-center rounded-xl border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/5 cursor-pointer">
                Browse Jobs
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
