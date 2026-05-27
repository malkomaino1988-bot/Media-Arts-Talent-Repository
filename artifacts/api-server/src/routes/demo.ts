import { createHash } from "node:crypto";
import { Router } from "express";
import {
  CreateAdBody,
  CreateJobBody,
  CreateUserBody,
  DeleteAdParams,
  DeleteJobParams,
  DeleteMediaParams,
  DeleteUserParams,
  GetJobParams,
  GetTalentParams,
  GetUserMediaParams,
  GetUserMembershipParams,
  GetUserParams,
  HealthCheckResponse,
  ListAdsQueryParams,
  ListJobsQueryParams,
  ListTalentsQueryParams,
  ListUsersQueryParams,
  SubscribeMembershipBody,
  UpdateAdBody,
  UpdateAdParams,
  UpdateJobBody,
  UpdateJobParams,
  UpdateUserBody,
  UpdateUserParams,
  UploadMediaBody,
} from "@workspace/api-zod";
import { listAdminActivity, recordAdminActivity } from "../lib/activity-log";

const router = Router();

type UserRole = "user" | "admin";
type JobStatus = "active" | "draft" | "expired";
type AdStatus = "pending" | "active" | "inactive";
type MediaType = "image" | "video" | "audio" | "document";
type AdPlacement = "sidebar" | "footer";

type DemoUser = {
  id: number;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  city: string;
  province: string;
  country: string;
  planName: string | null;
  bio: string | null;
  jobTitle: string | null;
  talentTags: string[];
  yearsExperience: number | null;
  gender: string | null;
  age: number | null;
  website: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  profilePhotoUrl: string | null;
  bannerUrl: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type DemoMedia = {
  id: number;
  userId: number;
  url: string;
  title: string | null;
  mediaType: MediaType;
  createdAt: string;
};

type DemoJob = {
  id: number;
  userId: number;
  title: string;
  company: string;
  description: string;
  category: string;
  city: string;
  province: string;
  compensation: string | null;
  contactEmail: string;
  status: JobStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

type DemoAd = {
  id: number;
  userId: number;
  placement: AdPlacement;
  imageUrl: string;
  linkUrl: string;
  altText: string | null;
  priceMonthly: number;
  status: AdStatus;
  impressions: number;
  clicks: number;
  startDate: string;
  expiresAt: string;
  createdAt: string;
};

type DemoSubscription = {
  id: number;
  userId: number;
  planSlug: string;
  planName: string;
  status: "active";
  startDate: string;
  expiresAt: string;
  createdAt: string;
  paypalOrderId: string;
};

const PLANS = [
  {
    id: 1,
    name: "Friend",
    slug: "friend",
    priceYearly: 25,
    bioLimit: 150,
    talentLimit: 3,
    mediaLimit: 0,
    jobCredits: 0,
    hasPriority: false,
    hasCompanyLogo: false,
    isBusinessPlan: false,
    isMostPopular: false,
    description: "Perfect for getting started in the Windsor creative community.",
    features: ["Up to 150 character bio", "List up to 3 talent types", "Basic profile page", "Searchable in directory"],
  },
  {
    id: 2,
    name: "Bronze",
    slug: "bronze",
    priceYearly: 50,
    bioLimit: 300,
    talentLimit: 5,
    mediaLimit: 3,
    jobCredits: 0,
    hasPriority: false,
    hasCompanyLogo: false,
    isBusinessPlan: false,
    isMostPopular: false,
    description: "Expand your presence with a richer profile and media gallery.",
    features: ["Up to 300 character bio", "List up to 5 talent types", "Upload up to 3 media files", "Enhanced profile page", "Searchable in directory"],
  },
  {
    id: 3,
    name: "Silver",
    slug: "silver",
    priceYearly: 100,
    bioLimit: 600,
    talentLimit: 10,
    mediaLimit: 10,
    jobCredits: 0,
    hasPriority: false,
    hasCompanyLogo: false,
    isBusinessPlan: false,
    isMostPopular: true,
    description: "The most popular choice for serious creative professionals.",
    features: ["Up to 600 character bio", "List up to 10 talent types", "Upload up to 10 media files", "Full media gallery", "Searchable in directory", "Profile analytics"],
  },
  {
    id: 4,
    name: "Gold",
    slug: "gold",
    priceYearly: 250,
    bioLimit: null,
    talentLimit: null,
    mediaLimit: 25,
    jobCredits: 0,
    hasPriority: true,
    hasCompanyLogo: false,
    isBusinessPlan: false,
    isMostPopular: false,
    description: "Maximum visibility with priority placement and unlimited profile space.",
    features: ["Unlimited bio length", "Unlimited talent types", "Upload up to 25 media files", "Priority placement in search", "Full media gallery", "Advanced analytics"],
  },
  {
    id: 5,
    name: "Gold Business",
    slug: "gold-business",
    priceYearly: 500,
    bioLimit: null,
    talentLimit: null,
    mediaLimit: 25,
    jobCredits: 5,
    hasPriority: true,
    hasCompanyLogo: true,
    isBusinessPlan: true,
    isMostPopular: false,
    description: "Everything in Gold plus company branding and job posting credits.",
    features: ["All Gold features", "Company logo on profile", "5 job posting credits ($100 value each)", "Business profile badge", "Priority placement in search", "Recruiter tools"],
  },
  {
    id: 6,
    name: "Platinum Business",
    slug: "platinum-business",
    priceYearly: 1000,
    bioLimit: null,
    talentLimit: null,
    mediaLimit: 25,
    jobCredits: 15,
    hasPriority: true,
    hasCompanyLogo: true,
    isBusinessPlan: true,
    isMostPopular: false,
    description: "The ultimate business package for agencies and major employers.",
    features: ["All Gold Business features", "15 job posting credits ($1,500 value)", "Featured employer badge", "Top priority placement", "Dedicated account support", "Custom branding options"],
  },
] as const;

const now = new Date();

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function isoDaysFromToday(days: number) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString();
}

let userIdSeq = 4;
let mediaIdSeq = 4;
let jobIdSeq = 4;
let adIdSeq = 3;
let subscriptionIdSeq = 4;

const users: DemoUser[] = [
  {
    id: 1,
    email: "admin@matr.local",
    passwordHash: hashPassword("admin123"),
    firstName: "MATR",
    lastName: "Admin",
    phone: null,
    city: "Windsor",
    province: "ON",
    country: "Canada",
    planName: "Platinum Business",
    bio: "Platform administrator for the local creative directory.",
    jobTitle: "Administrator",
    talentTags: ["Production", "Writing & Content"],
    yearsExperience: 12,
    gender: null,
    age: null,
    website: "https://matr.local/admin",
    instagram: null,
    twitter: null,
    linkedin: null,
    profilePhotoUrl: null,
    bannerUrl: null,
    role: "admin",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: 2,
    email: "talent@matr.local",
    passwordHash: hashPassword("demo123"),
    firstName: "Avery",
    lastName: "Cole",
    phone: null,
    city: "Windsor",
    province: "ON",
    country: "Canada",
    planName: "Gold",
    bio: "Director and editor creating commercial and documentary work across Windsor-Essex.",
    jobTitle: "Director / Editor",
    talentTags: ["Film & Video", "Editing", "Writing & Content"],
    yearsExperience: 8,
    gender: "Non-binary",
    age: 31,
    website: "https://example.com/avery",
    instagram: "averycreates",
    twitter: "averycreates",
    linkedin: "https://linkedin.com/in/averycole",
    profilePhotoUrl: null,
    bannerUrl: null,
    role: "user",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: 3,
    email: "brand@matr.local",
    passwordHash: hashPassword("demo123"),
    firstName: "Jordan",
    lastName: "Bennett",
    phone: null,
    city: "Tecumseh",
    province: "ON",
    country: "Canada",
    planName: "Gold Business",
    bio: "Creative producer hiring local crews and promoting regional campaigns.",
    jobTitle: "Creative Producer",
    talentTags: ["Production", "Photography", "Graphic Design"],
    yearsExperience: 10,
    gender: null,
    age: 38,
    website: "https://example.com/jordan",
    instagram: "jordanbennettstudio",
    twitter: null,
    linkedin: "https://linkedin.com/in/jordanbennett",
    profilePhotoUrl: null,
    bannerUrl: null,
    role: "user",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
];

const media: DemoMedia[] = [
  { id: 1, userId: 2, url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80", title: "Campaign still", mediaType: "image", createdAt: now.toISOString() },
  { id: 2, userId: 2, url: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80", title: "Behind the scenes", mediaType: "image", createdAt: now.toISOString() },
  { id: 3, userId: 3, url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80", title: "Producer reel", mediaType: "image", createdAt: now.toISOString() },
];

const jobs: DemoJob[] = [
  {
    id: 1,
    userId: 3,
    title: "Freelance Videographer Needed",
    company: "Bennett Creative",
    description: "Looking for a local videographer for a two-day branded content shoot with interview and b-roll coverage.",
    category: "Film & Video",
    city: "Windsor",
    province: "ON",
    compensation: "$800 flat",
    contactEmail: "brand@matr.local",
    status: "active",
    expiresAt: isoDaysFromToday(45),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: 2,
    userId: 3,
    title: "Production Assistant",
    company: "Bennett Creative",
    description: "Support on set, talent wrangling, and basic logistics for a one-week campaign production.",
    category: "Production",
    city: "Tecumseh",
    province: "ON",
    compensation: "$25/hour",
    contactEmail: "brand@matr.local",
    status: "draft",
    expiresAt: isoDaysFromToday(60),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: 3,
    userId: 2,
    title: "Photographer for Live Event",
    company: "Avery Cole Studio",
    description: "Seeking an event photographer to capture speaker sessions, networking, and branded activations.",
    category: "Photography",
    city: "LaSalle",
    province: "ON",
    compensation: "$500 flat",
    contactEmail: "talent@matr.local",
    status: "active",
    expiresAt: isoDaysFromToday(30),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
];

const ads: DemoAd[] = [
  {
    id: 1,
    userId: 3,
    placement: "sidebar",
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    linkUrl: "https://example.com/campaign",
    altText: "Campaign promotion",
    priceMonthly: 30,
    status: "active",
    impressions: 1820,
    clicks: 74,
    startDate: now.toISOString(),
    expiresAt: isoDaysFromToday(30),
    createdAt: now.toISOString(),
  },
  {
    id: 2,
    userId: 3,
    placement: "footer",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80",
    linkUrl: "https://example.com/services",
    altText: "Creative services",
    priceMonthly: 15,
    status: "pending",
    impressions: 0,
    clicks: 0,
    startDate: now.toISOString(),
    expiresAt: isoDaysFromToday(30),
    createdAt: now.toISOString(),
  },
];

const subscriptions: DemoSubscription[] = [
  { id: 1, userId: 1, planSlug: "platinum-business", planName: "Platinum Business", status: "active", startDate: now.toISOString(), expiresAt: isoDaysFromToday(365), createdAt: now.toISOString(), paypalOrderId: "DEMO-SUB-1" },
  { id: 2, userId: 2, planSlug: "gold", planName: "Gold", status: "active", startDate: now.toISOString(), expiresAt: isoDaysFromToday(365), createdAt: now.toISOString(), paypalOrderId: "DEMO-SUB-2" },
  { id: 3, userId: 3, planSlug: "gold-business", planName: "Gold Business", status: "active", startDate: now.toISOString(), expiresAt: isoDaysFromToday(365), createdAt: now.toISOString(), paypalOrderId: "DEMO-SUB-3" },
];

function safeUser(user: DemoUser) {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

function priorityRank(planName: string | null) {
  switch (planName) {
    case "Platinum Business": return 1;
    case "Gold Business": return 2;
    case "Gold": return 3;
    case "Silver": return 4;
    default: return 5;
  }
}

router.get("/health", (_req, res) => {
  res.json(HealthCheckResponse.parse({ status: "ok" }));
});

router.get("/healthz", (_req, res) => {
  res.json(HealthCheckResponse.parse({ status: "ok" }));
});

router.post("/auth/sign-in", (req, res): void => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const user = users.find((entry) => entry.email.toLowerCase() === email);

  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: "This account is inactive" });
    return;
  }

  if (user.role === "admin") {
    recordAdminActivity({
      actor: user,
      action: "admin.sign_in",
      targetType: "auth",
      targetId: user.id,
      summary: "Admin signed in",
    });
  }

  res.json(safeUser(user));
});

router.post("/auth/clerk-sync", (req, res): void => {
  const clerkId = typeof req.body?.clerkId === "string" ? req.body.clerkId.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const firstName = typeof req.body?.firstName === "string" ? req.body.firstName.trim() : "";
  const lastName = typeof req.body?.lastName === "string" ? req.body.lastName.trim() : "";
  const profilePhotoUrl = typeof req.body?.profilePhotoUrl === "string" && req.body.profilePhotoUrl.trim()
    ? req.body.profilePhotoUrl.trim()
    : null;

  if (!clerkId || !email) {
    res.status(400).json({ error: "Clerk account details are required" });
    return;
  }

  const existingUser = users.find((entry) => entry.email.toLowerCase() === email);

  if (existingUser) {
    if (!existingUser.isActive) {
      res.status(403).json({ error: "This account is inactive" });
      return;
    }

    existingUser.firstName = firstName || existingUser.firstName;
    existingUser.lastName = lastName || existingUser.lastName;
    existingUser.profilePhotoUrl = profilePhotoUrl ?? existingUser.profilePhotoUrl;
    existingUser.updatedAt = new Date().toISOString();

    res.json(safeUser(existingUser));
    return;
  }

  const timestamp = new Date().toISOString();
  const user: DemoUser = {
    id: userIdSeq++,
    email,
    passwordHash: hashPassword(`${clerkId}:${email}`),
    firstName: firstName || "MATR",
    lastName: lastName || "Member",
    phone: null,
    city: "Windsor",
    province: "ON",
    country: "Canada",
    planName: null,
    bio: null,
    jobTitle: null,
    talentTags: [],
    yearsExperience: null,
    gender: null,
    age: null,
    website: null,
    instagram: null,
    twitter: null,
    linkedin: null,
    profilePhotoUrl,
    bannerUrl: null,
    role: "user",
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  users.unshift(user);
  res.status(201).json(safeUser(user));
});

router.get("/admin/activity", (_req, res): void => {
  res.json(listAdminActivity());
});

router.get("/users", (req, res): void => {
  const query = ListUsersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { page = 1, limit = 20, plan, search } = query.data;
  let filtered = [...users];

  if (plan) filtered = filtered.filter((user) => user.planName === plan);
  if (search) {
    const normalized = search.toLowerCase();
    filtered = filtered.filter((user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(normalized) ||
      user.email.toLowerCase().includes(normalized),
    );
  }

  const offset = (page - 1) * limit;
  res.json({
    users: filtered.slice(offset, offset + limit).map(safeUser),
    total: filtered.length,
    page,
    limit,
  });
});

router.post("/users", (req, res): void => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (users.some((user) => user.email.toLowerCase() === parsed.data.email.toLowerCase())) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const timestamp = new Date().toISOString();
  const user: DemoUser = {
    id: userIdSeq++,
    email: parsed.data.email,
    passwordHash: hashPassword(parsed.data.password),
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    phone: parsed.data.phone ?? null,
    city: parsed.data.city,
    province: parsed.data.province,
    country: parsed.data.country,
    planName: parsed.data.planName,
    bio: parsed.data.bio ?? null,
    jobTitle: parsed.data.jobTitle ?? null,
    talentTags: parsed.data.talentTags ?? [],
    yearsExperience: parsed.data.yearsExperience ?? null,
    gender: parsed.data.gender ?? null,
    age: parsed.data.age ?? null,
    website: parsed.data.website ?? null,
    instagram: parsed.data.instagram ?? null,
    twitter: parsed.data.twitter ?? null,
    linkedin: parsed.data.linkedin ?? null,
    profilePhotoUrl: null,
    bannerUrl: null,
    role: "user",
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  users.unshift(user);
  res.status(201).json(safeUser(user));
});

router.get("/users/:id", (req, res): void => {
  const params = GetUserParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const user = users.find((entry) => entry.id === params.data.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(safeUser(user));
});

router.patch("/users/:id", (req, res): void => {
  const params = UpdateUserParams.safeParse({ id: Number(req.params.id) });
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    const error = !params.success ? params.error.message : parsed.success ? "Invalid request" : parsed.error.message;
    res.status(400).json({ error });
    return;
  }

  const user = users.find((entry) => entry.id === params.data.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  Object.assign(user, parsed.data, { updatedAt: new Date().toISOString() });
  res.json(safeUser(user));
});

router.delete("/users/:id", (req, res): void => {
  const params = DeleteUserParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const index = users.findIndex((entry) => entry.id === params.data.id);
  if (index === -1) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  users.splice(index, 1);
  res.sendStatus(204);
});

router.get("/talents/featured", (_req, res): void => {
  const featured = users
    .filter((user) => user.isActive && user.role === "user")
    .sort((a, b) => priorityRank(a.planName) - priorityRank(b.planName))
    .slice(0, 8)
    .map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      jobTitle: user.jobTitle,
      city: user.city,
      province: user.province,
      planName: user.planName,
      profilePhotoUrl: user.profilePhotoUrl,
      talentTags: user.talentTags,
      yearsExperience: user.yearsExperience,
    }));

  res.json(featured);
});

router.get("/talents", (req, res): void => {
  const query = ListTalentsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const {
    page = 1,
    limit = 12,
    search,
    city,
    region,
    gender,
    minAge,
    maxAge,
    minExperience,
    maxExperience,
    talentType,
  } = query.data;

  const selectedTags = talentType?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];

  let filtered = users.filter((user) => user.isActive && user.role === "user");
  if (search) {
    const normalized = search.toLowerCase();
    filtered = filtered.filter((user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(normalized) ||
      (user.jobTitle ?? "").toLowerCase().includes(normalized) ||
      user.talentTags.some((tag) => tag.toLowerCase().includes(normalized)),
    );
  }
  if (city) filtered = filtered.filter((user) => user.city.toLowerCase().includes(city.toLowerCase()));
  if (region) filtered = filtered.filter((user) => user.province.toLowerCase().includes(region.toLowerCase()));
  if (gender) filtered = filtered.filter((user) => user.gender === gender);
  if (minAge !== undefined) filtered = filtered.filter((user) => (user.age ?? 0) >= minAge);
  if (maxAge !== undefined) filtered = filtered.filter((user) => (user.age ?? 999) <= maxAge);
  if (minExperience !== undefined) filtered = filtered.filter((user) => (user.yearsExperience ?? 0) >= minExperience);
  if (maxExperience !== undefined) filtered = filtered.filter((user) => (user.yearsExperience ?? 999) <= maxExperience);
  if (selectedTags.length > 0) {
    filtered = filtered.filter((user) => selectedTags.some((tag) => user.talentTags.includes(tag)));
  }

  filtered.sort((a, b) => {
    const rank = priorityRank(a.planName) - priorityRank(b.planName);
    if (rank !== 0) return rank;
    return a.createdAt.localeCompare(b.createdAt);
  });

  const offset = (page - 1) * limit;
  res.json({
    talents: filtered.slice(offset, offset + limit).map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      jobTitle: user.jobTitle,
      city: user.city,
      province: user.province,
      planName: user.planName,
      profilePhotoUrl: user.profilePhotoUrl,
      talentTags: user.talentTags,
      yearsExperience: user.yearsExperience,
    })),
    total: filtered.length,
    page,
    limit,
  });
});

router.get("/talents/:id", (req, res): void => {
  const params = GetTalentParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const user = users.find((entry) => entry.id === params.data.id && entry.isActive);
  if (!user) {
    res.status(404).json({ error: "Talent not found" });
    return;
  }

  res.json({ ...safeUser(user), media: media.filter((item) => item.userId === user.id) });
});

router.get("/memberships/plans", (_req, res): void => {
  res.json(PLANS);
});

router.post("/memberships/subscribe", (req, res): void => {
  const parsed = SubscribeMembershipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const plan = PLANS.find((entry) => entry.slug === parsed.data.planSlug);
  const user = users.find((entry) => entry.id === parsed.data.userId);
  if (!plan || !user) {
    res.status(400).json({ error: "Invalid subscription request" });
    return;
  }

  const subscription: DemoSubscription = {
    id: subscriptionIdSeq++,
    userId: parsed.data.userId,
    planSlug: parsed.data.planSlug,
    planName: plan.name,
    status: "active",
    startDate: new Date().toISOString(),
    expiresAt: isoDaysFromToday(365),
    createdAt: new Date().toISOString(),
    paypalOrderId: parsed.data.paypalOrderId,
  };

  subscriptions.unshift(subscription);
  user.planName = plan.name;
  user.updatedAt = new Date().toISOString();

  res.status(201).json(subscription);
});

router.get("/memberships/:userId", (req, res): void => {
  const params = GetUserMembershipParams.safeParse({ userId: Number(req.params.userId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const subscription = subscriptions.find((entry) => entry.userId === params.data.userId);
  if (!subscription) {
    res.status(404).json({ error: "No membership found" });
    return;
  }

  res.json(subscription);
});

router.get("/jobs", (req, res): void => {
  const query = ListJobsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { page = 1, limit = 10, search, city, category } = query.data;
  const statusFilter = typeof req.query.status === "string" ? req.query.status : undefined;
  const includeAll = req.query.scope === "all";

  let filtered = [...jobs];
  if (!includeAll) {
    filtered = filtered.filter((job) => job.status === "active");
  } else if (statusFilter === "active" || statusFilter === "draft" || statusFilter === "expired") {
    filtered = filtered.filter((job) => job.status === statusFilter);
  }

  if (search) {
    const normalized = search.toLowerCase();
    filtered = filtered.filter((job) =>
      job.title.toLowerCase().includes(normalized) ||
      job.company.toLowerCase().includes(normalized) ||
      job.description.toLowerCase().includes(normalized),
    );
  }
  if (city) filtered = filtered.filter((job) => job.city.toLowerCase().includes(city.toLowerCase()));
  if (category) filtered = filtered.filter((job) => job.category === category);

  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const offset = (page - 1) * limit;
  res.json({ jobs: filtered.slice(offset, offset + limit), total: filtered.length, page, limit });
});

router.post("/jobs", (req, res): void => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const timestamp = new Date().toISOString();
  const job: DemoJob = {
    id: jobIdSeq++,
    userId: parsed.data.userId,
    title: parsed.data.title,
    company: parsed.data.company,
    description: parsed.data.description,
    category: parsed.data.category,
    city: parsed.data.city,
    province: parsed.data.province,
    compensation: parsed.data.compensation ?? null,
    contactEmail: parsed.data.contactEmail,
    status: "active",
    expiresAt: isoDaysFromToday(60),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  jobs.unshift(job);
  res.status(201).json(job);
});

router.get("/jobs/:id", (req, res): void => {
  const params = GetJobParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const job = jobs.find((entry) => entry.id === params.data.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(job);
});

router.patch("/jobs/:id", (req, res): void => {
  const params = UpdateJobParams.safeParse({ id: Number(req.params.id) });
  const parsed = UpdateJobBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    const error = !params.success ? params.error.message : parsed.success ? "Invalid request" : parsed.error.message;
    res.status(400).json({ error });
    return;
  }

  const job = jobs.find((entry) => entry.id === params.data.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  Object.assign(job, parsed.data, { updatedAt: new Date().toISOString() });
  res.json(job);
});

router.delete("/jobs/:id", (req, res): void => {
  const params = DeleteJobParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const index = jobs.findIndex((entry) => entry.id === params.data.id);
  if (index === -1) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  jobs.splice(index, 1);
  res.sendStatus(204);
});

router.get("/ads", (req, res): void => {
  const query = ListAdsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { placement, active } = query.data;
  let filtered = [...ads];
  if (placement) filtered = filtered.filter((ad) => ad.placement === placement);
  if (active !== undefined) filtered = filtered.filter((ad) => ad.status === (active ? "active" : "inactive"));
  res.json(filtered);
});

router.post("/ads", (req, res): void => {
  const parsed = CreateAdBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const ad: DemoAd = {
    id: adIdSeq++,
    userId: parsed.data.userId,
    placement: parsed.data.placement,
    imageUrl: parsed.data.imageUrl,
    linkUrl: parsed.data.linkUrl,
    altText: parsed.data.altText ?? null,
    priceMonthly: parsed.data.placement === "footer" ? 15 : 30,
    status: "active",
    impressions: 0,
    clicks: 0,
    startDate: new Date().toISOString(),
    expiresAt: isoDaysFromToday(30),
    createdAt: new Date().toISOString(),
  };

  ads.unshift(ad);
  res.status(201).json(ad);
});

router.patch("/ads/:id", (req, res): void => {
  const params = UpdateAdParams.safeParse({ id: Number(req.params.id) });
  const parsed = UpdateAdBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    const error = !params.success ? params.error.message : parsed.success ? "Invalid request" : parsed.error.message;
    res.status(400).json({ error });
    return;
  }

  const ad = ads.find((entry) => entry.id === params.data.id);
  if (!ad) {
    res.status(404).json({ error: "Ad not found" });
    return;
  }

  Object.assign(ad, parsed.data);
  res.json(ad);
});

router.delete("/ads/:id", (req, res): void => {
  const params = DeleteAdParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const index = ads.findIndex((entry) => entry.id === params.data.id);
  if (index === -1) {
    res.status(404).json({ error: "Ad not found" });
    return;
  }

  ads.splice(index, 1);
  res.sendStatus(204);
});

router.post("/media", (req, res): void => {
  const parsed = UploadMediaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const item: DemoMedia = {
    id: mediaIdSeq++,
    userId: parsed.data.userId,
    url: parsed.data.url,
    title: parsed.data.title ?? null,
    mediaType: parsed.data.mediaType,
    createdAt: new Date().toISOString(),
  };

  media.unshift(item);
  res.status(201).json(item);
});

router.get("/media/:userId", (req, res): void => {
  const params = GetUserMediaParams.safeParse({ userId: Number(req.params.userId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  res.json(media.filter((item) => item.userId === params.data.userId));
});

router.delete("/media/:id/delete", (req, res): void => {
  const params = DeleteMediaParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const index = media.findIndex((entry) => entry.id === params.data.id);
  if (index === -1) {
    res.status(404).json({ error: "Media not found" });
    return;
  }

  media.splice(index, 1);
  res.sendStatus(204);
});

router.get("/stats/overview", (_req, res): void => {
  const activeSubscriptions = subscriptions.filter((entry) => entry.status === "active");
  const revenueBySlug: Record<string, number> = Object.fromEntries(PLANS.map((plan) => [plan.slug, plan.priceYearly]));
  const totalRevenue = activeSubscriptions.reduce((sum, entry) => sum + (revenueBySlug[entry.planSlug] ?? 0), 0);

  res.json({
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.isActive).length,
    totalTalents: users.filter((user) => user.role === "user").length,
    totalJobs: jobs.length,
    activeJobs: jobs.filter((job) => job.status === "active").length,
    totalAds: ads.length,
    activeAds: ads.filter((ad) => ad.status === "active").length,
    totalRevenue,
  });
});

router.get("/stats/talent-types", (_req, res): void => {
  const counts = new Map<string, number>();
  for (const user of users.filter((entry) => entry.isActive)) {
    for (const tag of user.talentTags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  res.json(
    [...counts.entries()]
      .map(([talentType, count]) => ({ talentType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15),
  );
});

router.get("/stats/membership-distribution", (_req, res): void => {
  const distribution = subscriptions.reduce<Record<string, { planName: string; count: number; revenue: number }>>((acc, entry) => {
    const revenue = PLANS.find((plan) => plan.slug === entry.planSlug)?.priceYearly ?? 0;
    acc[entry.planSlug] ??= { planName: entry.planName, count: 0, revenue: 0 };
    acc[entry.planSlug].count += 1;
    acc[entry.planSlug].revenue += revenue;
    return acc;
  }, {});

  res.json(Object.values(distribution));
});

export default router;
