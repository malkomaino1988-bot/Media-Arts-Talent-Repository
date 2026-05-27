import { SignIn } from "@clerk/react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { clerkAppearance } from "@/lib/clerk";
import { useAuth } from "@/lib/auth";
import { buildAuthHref, getRedirectTarget } from "@/lib/auth-routes";

export default function SignInPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const redirectTarget = getRedirectTarget("/dashboard");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation(user?.role === "admin" && redirectTarget === "/dashboard" ? "/admin" : redirectTarget);
    }
  }, [isAuthenticated, isLoading, redirectTarget, setLocation, user?.role]);

  return (
    <div className="flex min-h-screen bg-black">
      <div
        className="relative hidden items-center justify-center overflow-hidden lg:flex lg:w-1/2"
        style={{ background: "linear-gradient(135deg, #111 0%, #222 50%, #E50914 150%)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(45deg, transparent 48%, rgba(255,255,255,.1) 50%, transparent 52%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative max-w-sm p-12 text-white">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E50914]">
              <span className="font-black text-white">M</span>
            </div>
            <span className="text-xl font-black text-white">MATR</span>
          </div>
          <h2 className="mb-4 text-4xl font-black leading-tight">
            Welcome back to Windsor's creative hub
          </h2>
          <p className="text-lg text-white/50">
            Sign in with Clerk to manage your profile, review opportunities, and access the full product.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-white px-4 py-16 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#E50914]">
              <span className="text-sm font-black text-white">M</span>
            </div>
            <span className="text-lg font-black text-black">MATR</span>
          </div>

          <h1 className="mb-2 text-3xl font-black text-black">Sign In</h1>
          <p className="mb-8 text-gray-500">Use Clerk to access your creative profile, dashboard, and admin tools.</p>

          <div className="matr-premium-card p-4 sm:p-6">
            <div className="relative z-10">
              <SignIn
                appearance={clerkAppearance}
                routing="path"
                path="/sign-in"
                signUpUrl={buildAuthHref("/sign-up", { redirectTo: redirectTarget })}
                forceRedirectUrl={redirectTarget}
                fallbackRedirectUrl={redirectTarget}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
