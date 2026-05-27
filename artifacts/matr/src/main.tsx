import { ClerkProvider } from "@clerk/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { clerkPublishableKey } from "@/lib/clerk";

function notifyLocationChange() {
  window.dispatchEvent(new PopStateEvent("popstate"));
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={clerkPublishableKey}
    routerPush={(to) => {
      window.history.pushState({}, "", to);
      notifyLocationChange();
    }}
    routerReplace={(to) => {
      window.history.replaceState({}, "", to);
      notifyLocationChange();
    }}
  >
    <App />
  </ClerkProvider>,
);
