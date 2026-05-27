import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Menu, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { buildAuthHref } from "@/lib/auth-routes";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore Talent" },
  { href: "/membership", label: "Membership Plans" },
  { href: "/post-job", label: "Post a Job" },
  { href: "/advertise", label: "Advertise" },
  { href: "/support", label: "Support" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, signOut, isLoading } = useAuth();

  const accountLinks = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard" },
        ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/88 backdrop-blur-xl">
      <div className="border-b border-black/5 bg-black text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-white/70">
            <Sparkles size={12} className="text-[#E50914]" />
            <span>Creative directory, jobs, ads, and member profiles in one place.</span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-white/55">
            <span>Windsor-Essex creative network</span>
            <span>Built for talent, crews, and brands</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between">
          <Link href="/" data-testid="link-logo">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[#E50914] shadow-[0_14px_28px_rgba(229,9,20,0.28)] transition-transform group-hover:-translate-y-0.5">
                <span className="text-white font-black text-sm">M</span>
              </div>
              <div className="hidden sm:block">
                <span className="block font-black text-black text-lg tracking-tight leading-none">MATR</span>
                <span className="block text-[10px] uppercase tracking-[0.24em] text-gray-400 mt-1">
                  Media Arts Talent Repository
                </span>
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-black/6 bg-[#f7f6f2] px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <span
                  className={`cursor-pointer rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    location === link.href
                      ? "bg-white text-[#E50914] shadow-sm"
                      : "text-gray-700 hover:bg-white hover:text-black"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            {accountLinks.map((link) => (
              <Link key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase()}`}>
                <span
                  className={`cursor-pointer rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    location === link.href
                      ? "bg-white text-[#E50914] shadow-sm"
                      : "text-gray-700 hover:bg-white hover:text-black"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {isLoading ? null : isAuthenticated ? (
              <>
                <span className="hidden rounded-full border border-gray-200 bg-[#f7f6f2] px-3 py-1.5 text-sm text-gray-500 xl:block">
                  {user?.firstName} {user?.lastName}
                </span>
                <Button variant="ghost" size="sm" onClick={() => { void signOut(); }} className="rounded-xl" data-testid="button-sign-out">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href={buildAuthHref("/sign-in", { redirectTo: location })}>
                  <Button variant="ghost" size="sm" className="rounded-xl" data-testid="button-sign-in">
                    Sign In
                  </Button>
                </Link>
                <Link href={buildAuthHref("/sign-up", { redirectTo: location })}>
                  <Button
                    size="sm"
                    className="rounded-xl bg-[#E50914] text-white font-semibold shadow-[0_14px_24px_rgba(229,9,20,0.24)] hover:bg-[#b40710]"
                    data-testid="button-sign-up"
                  >
                    Join the Directory
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button variant="outline" size="sm" className="rounded-xl border-gray-200 gap-2">
                    Browse Jobs
                    <ArrowUpRight size={14} />
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-xl p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
            onClick={() => setOpen(!open)}
            data-testid="button-mobile-menu"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span
                    className={`block px-3 py-2.5 text-sm font-medium rounded-md cursor-pointer ${
                      location === link.href
                        ? "text-[#E50914] bg-red-50"
                        : "text-gray-700 hover:text-black hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
              {accountLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  data-testid={`link-mobile-${link.label.toLowerCase()}`}
                >
                  <span
                    className={`block px-3 py-2.5 text-sm font-medium rounded-md cursor-pointer ${
                      location === link.href
                        ? "text-[#E50914] bg-red-50"
                        : "text-gray-700 hover:text-black hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={() => {
                      void signOut();
                      setOpen(false);
                    }}
                    data-testid="button-mobile-sign-out"
                  >
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link href={buildAuthHref("/sign-in", { redirectTo: location })} onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full" size="sm" data-testid="button-mobile-sign-in">
                        Sign In
                      </Button>
                    </Link>
                    <Link href={buildAuthHref("/sign-up", { redirectTo: location })} onClick={() => setOpen(false)}>
                      <Button
                        className="w-full bg-[#E50914] hover:bg-[#b40710] text-white font-semibold"
                        size="sm"
                        data-testid="button-mobile-sign-up"
                      >
                        Join the Directory
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
