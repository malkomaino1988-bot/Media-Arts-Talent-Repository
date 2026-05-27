export function buildAuthHref(
  path: "/sign-in" | "/sign-up",
  options?: { redirectTo?: string; plan?: string | null },
) {
  const params = new URLSearchParams();

  if (options?.redirectTo) {
    params.set("redirect_url", options.redirectTo);
  }

  if (options?.plan) {
    params.set("plan", options.plan);
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function getRedirectTarget(fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("redirect_url") || fallback;
}
