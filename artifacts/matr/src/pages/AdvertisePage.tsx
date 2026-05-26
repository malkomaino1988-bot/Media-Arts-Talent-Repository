import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Monitor, BarChart2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreateAd } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";

const AD_PLACEMENTS = [
  {
    id: "sidebar",
    name: "Sidebar Advertisement",
    price: 30,
    dimensions: "300 × 250px",
    description: "Maximum visibility. Your ad appears in the sidebar on every page of the MATR directory — home, explore, profiles, and job board.",
    impressions: "~5,000/month estimated",
    badge: "Most Visible",
  },
  {
    id: "footer",
    name: "Footer Advertisement",
    price: 15,
    dimensions: "728 × 90px",
    description: "Cost-effective brand exposure. Your banner appears in the footer of all pages, reaching every visitor to the directory.",
    impressions: "~8,000/month estimated",
    badge: "Best Value",
  },
];

export default function AdvertisePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const createAd = useCreateAd();

  const [selected, setSelected] = useState<"sidebar" | "footer" | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [step, setStep] = useState<"choose" | "details" | "pay">("choose");

  const selectedPlacement = AD_PLACEMENTS.find((p) => p.id === selected);

  const handleNext = () => {
    if (!selected) {
      toast({ title: "Please choose a placement", variant: "destructive" });
      return;
    }
    if (step === "choose") { setStep("details"); return; }
    if (step === "details") {
      if (!imageUrl || !linkUrl) {
        toast({ title: "Please fill in all required fields", variant: "destructive" });
        return;
      }
      setStep("pay");
    }
  };

  const handlePay = async () => {
    if (!user) {
      toast({ title: "Please sign in to create an ad", variant: "destructive" });
      setLocation("/sign-in");
      return;
    }

    try {
      await createAd.mutateAsync({
        data: {
          userId: user.id,
          placement: selected!,
          imageUrl,
          linkUrl,
          altText: altText || null,
          paypalOrderId: `AD-${Date.now()}`,
        },
      });
      toast({ title: "Advertisement submitted!", description: "Your ad will be reviewed and go live within 24 hours." });
      setLocation("/");
    } catch {
      toast({ title: "Failed to create ad", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Monitor className="text-[#E50914]" size={28} />
            <h1 className="text-4xl md:text-6xl font-black">Advertise</h1>
          </div>
          <p className="text-white/50 text-lg max-w-xl">
            Reach Windsor's creative community — photographers, filmmakers, musicians, designers, and more.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isLoading && !isAuthenticated ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-gray-500 mb-6">Sign in first to create and manage ad placements.</p>
            <Link href="/sign-in">
              <Button className="bg-[#E50914] hover:bg-[#b40710] text-white font-semibold rounded-xl">
                Sign In
              </Button>
            </Link>
          </div>
        ) : step === "choose" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-black text-black mb-8">Choose Your Placement</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {AD_PLACEMENTS.map((placement, i) => (
                <motion.div
                  key={placement.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelected(placement.id as "sidebar" | "footer")}
                  className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                    selected === placement.id
                      ? "border-[#E50914] shadow-md bg-white"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  data-testid={`card-placement-${placement.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-black text-lg">{placement.name}</h3>
                    <span className="text-xs bg-black text-white px-2.5 py-1 rounded-full font-semibold">
                      {placement.badge}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-[#E50914] mb-1">${placement.price}<span className="text-base text-gray-400 font-normal">/month</span></div>
                  <p className="text-gray-500 text-sm mb-4">{placement.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Eye size={14} />
                      <span>{placement.impressions}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Monitor size={14} />
                      <span>{placement.dimensions}</span>
                    </div>
                  </div>

                  <div className={`mt-5 w-full rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                    selected === placement.id
                      ? "bg-[#E50914] text-white h-10"
                      : "bg-gray-100 text-gray-600 h-10"
                  }`}>
                    {selected === placement.id ? "Selected" : "Choose This"}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                <BarChart2 size={18} className="text-[#E50914]" />
                Platform Reach
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "500+", label: "Creative Professionals" },
                  { value: "2,000+", label: "Monthly Visitors" },
                  { value: "Windsor", label: "Hyper-local Targeting" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-black text-black">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleNext}
              disabled={!selected}
              className="w-full h-12 bg-[#E50914] hover:bg-[#b40710] text-white font-bold rounded-xl text-base"
              data-testid="button-proceed-ad"
            >
              Continue with {selectedPlacement?.name ?? "Selected Placement"}
            </Button>
          </motion.div>
        ) : step === "details" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-black text-black mb-2">Ad Details</h2>
            <p className="text-gray-500 mb-8">
              {selectedPlacement?.name} — ${selectedPlacement?.price}/month
            </p>

            <div className="bg-white rounded-2xl border border-gray-200 p-7 space-y-5">
              <div>
                <Label className="font-semibold text-sm">Ad Image URL *</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="mt-1.5 rounded-xl"
                  placeholder="https://your-ad-image.com/banner.jpg"
                  data-testid="input-image-url"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Recommended: {selectedPlacement?.dimensions}
                </p>
              </div>

              <div>
                <Label className="font-semibold text-sm">Destination URL *</Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="mt-1.5 rounded-xl"
                  placeholder="https://yourwebsite.com"
                  data-testid="input-link-url"
                />
              </div>

              <div>
                <Label className="font-semibold text-sm">Alt Text</Label>
                <Input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="mt-1.5 rounded-xl"
                  placeholder="Brief description of your ad"
                  data-testid="input-alt-text"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep("choose")} className="rounded-xl" data-testid="button-back-choose">
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 h-12 bg-[#E50914] hover:bg-[#b40710] text-white font-bold rounded-xl"
                data-testid="button-proceed-payment"
              >
                Proceed to Payment
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-black text-black mb-8">Review & Pay</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-black mb-4">Order Summary</h3>
                <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Placement</span>
                    <span className="font-medium">{selectedPlacement?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium">1 month</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span className="text-[#E50914]">${selectedPlacement?.price}.00/month</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-black mb-4">Payment</h3>
                <Button
                  onClick={handlePay}
                  disabled={createAd.isPending}
                  className="w-full h-12 bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold rounded-xl"
                  data-testid="button-paypal-ad"
                >
                  {createAd.isPending ? "Processing..." : `Pay $${selectedPlacement?.price} with PayPal`}
                </Button>
                <p className="text-xs text-gray-400 text-center mt-3">Sandbox mode</p>
              </div>
            </div>

            <Button variant="outline" onClick={() => setStep("details")} className="mt-4 rounded-xl" data-testid="button-back-details">
              Edit Ad Details
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
