import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

export default function SignInPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const user = await signIn(email, password);
      toast({ title: "Welcome back", description: `Signed in as ${user.firstName} ${user.lastName}.` });
      setLocation(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #111 0%, #222 50%, #E50914 150%)" }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(45deg, transparent 48%, rgba(255,255,255,.1) 50%, transparent 52%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative text-white p-12 max-w-sm">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#E50914] rounded-lg flex items-center justify-center">
              <span className="text-white font-black">M</span>
            </div>
            <span className="text-white font-black text-xl">MATR</span>
          </div>
          <h2 className="text-4xl font-black leading-tight mb-4">
            Welcome back to Windsor's creative hub
          </h2>
          <p className="text-white/50 text-lg">
            Sign in to manage your profile, connect with opportunities, and grow your creative career.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#E50914] rounded-sm flex items-center justify-center">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <span className="font-black text-black text-lg">MATR</span>
          </div>

          <h1 className="text-3xl font-black text-black mb-2">Sign In</h1>
          <p className="text-gray-500 mb-8">Access your creative profile, dashboard, and admin tools.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-black">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-1.5 h-11 rounded-xl border-gray-200"
                data-testid="input-email"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-semibold text-black">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="h-11 rounded-xl border-gray-200 pr-10"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#E50914] hover:bg-[#b40710] text-white font-bold rounded-xl"
              data-testid="button-submit-signin"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link href="/sign-up">
              <span className="text-[#E50914] font-semibold hover:underline cursor-pointer" data-testid="link-sign-up">
                Join the Directory
              </span>
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
