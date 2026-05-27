export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error("Add VITE_CLERK_PUBLISHABLE_KEY to artifacts/matr/.env");
}

export const clerkAppearance = {
  variables: {
    colorPrimary: "#E50914",
    colorText: "#111111",
    colorTextSecondary: "#6b7280",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#111111",
    borderRadius: "1rem",
    fontFamily: "Instrument Sans, system-ui, sans-serif",
  },
  elements: {
    card: "shadow-none border border-gray-200 rounded-[1.75rem]",
    headerTitle: "text-black font-black tracking-tight",
    headerSubtitle: "text-gray-500",
    socialButtonsBlockButton:
      "rounded-xl border border-gray-200 text-black shadow-none hover:bg-gray-50",
    formButtonPrimary:
      "rounded-xl bg-[#E50914] text-white shadow-[0_18px_30px_rgba(229,9,20,0.18)] hover:bg-[#b40710]",
    formFieldInput: "rounded-xl border border-gray-200 h-11 shadow-none",
    footerActionLink: "text-[#E50914] font-semibold hover:text-[#b40710]",
    identityPreviewText: "text-black",
    formFieldLabel: "text-black font-semibold",
    dividerText: "text-gray-400",
    otpCodeFieldInput: "rounded-xl border border-gray-200 shadow-none",
    navbar: "hidden",
    pageScrollBox: "p-0",
  },
};
