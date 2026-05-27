import { Link } from "wouter";
import { Compass, Briefcase, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { buildAuthHref } from "@/lib/auth-routes";

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4 py-16">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid lg:grid-cols-[1.05fr_.95fr]">
          <div className="bg-black text-white p-8 md:p-12">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-3">Page Missing</p>
            <h1 className="text-6xl md:text-7xl font-black leading-none mb-4">404</h1>
            <p className="text-white/65 text-lg max-w-md">
              That page is not available, but the rest of the repository is still reachable from here.
            </p>
          </div>

          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-black text-black mb-3">Pick up where you left off</h2>
            <p className="text-gray-500 mb-8">
              Jump back into discovery, hiring, or account management instead of hitting a dead end.
            </p>

            <div className="grid gap-3">
              <Link href="/">
                <Button className="w-full justify-start rounded-2xl bg-[#E50914] hover:bg-[#b40710] text-white h-12">
                  Home
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" className="w-full justify-start rounded-2xl h-12 gap-2">
                  <Compass size={16} />
                  Explore Talent
                </Button>
              </Link>
              <Link href="/jobs">
                <Button variant="outline" className="w-full justify-start rounded-2xl h-12 gap-2">
                  <Briefcase size={16} />
                  Browse Jobs
                </Button>
              </Link>
              <Link href={isAuthenticated ? "/dashboard" : buildAuthHref("/sign-in", { redirectTo: "/dashboard" })}>
                <Button variant="outline" className="w-full justify-start rounded-2xl h-12 gap-2">
                  <LayoutDashboard size={16} />
                  {isAuthenticated ? "Open Dashboard" : "Sign In for Dashboard"}
                </Button>
              </Link>
              <Link href={isAuthenticated ? "/membership" : buildAuthHref("/sign-up", { redirectTo: "/membership" })}>
                <Button variant="outline" className="w-full justify-start rounded-2xl h-12">
                  {isAuthenticated ? "View Membership" : "Create Account"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
