import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore Talent" },
  { href: "/membership", label: "Membership Plans" },
  { href: "/post-job", label: "Post a Job" },
  { href: "/advertise", label: "Advertise" },
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
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-logo">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 bg-[#E50914] rounded-sm flex items-center justify-center">
                <span className="text-white font-black text-sm">M</span>
              </div>
              <span className="font-black text-black text-lg tracking-tight hidden sm:block">
                MATR
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <span
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
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
              <Link key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase()}`}>
                <span
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                    location === link.href
                      ? "text-[#E50914] bg-red-50"
                      : "text-gray-700 hover:text-black hover:bg-gray-50"
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
                <span className="text-sm text-gray-500 hidden xl:block">
                  {user?.firstName} {user?.lastName}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut} data-testid="button-sign-out">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" data-testid="button-sign-in">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="sm"
                    className="bg-[#E50914] hover:bg-[#b40710] text-white font-semibold"
                    data-testid="button-sign-up"
                  >
                    Join the Directory
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
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
                      signOut();
                      setOpen(false);
                    }}
                    data-testid="button-mobile-sign-out"
                  >
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link href="/sign-in" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full" size="sm" data-testid="button-mobile-sign-in">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up" onClick={() => setOpen(false)}>
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
