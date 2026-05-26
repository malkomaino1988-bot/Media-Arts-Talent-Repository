import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, subscriptionsTable, usersTable } from "@workspace/db";
import { SubscribeMembershipBody, GetUserMembershipParams } from "@workspace/api-zod";

const router = Router();

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
    features: [
      "Up to 150 character bio",
      "List up to 3 talent types",
      "Basic profile page",
      "Searchable in directory",
    ],
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
    features: [
      "Up to 300 character bio",
      "List up to 5 talent types",
      "Upload up to 3 media files",
      "Enhanced profile page",
      "Searchable in directory",
    ],
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
    features: [
      "Up to 600 character bio",
      "List up to 10 talent types",
      "Upload up to 10 media files",
      "Full media gallery",
      "Searchable in directory",
      "Profile analytics",
    ],
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
    features: [
      "Unlimited bio length",
      "Unlimited talent types",
      "Upload up to 25 media files",
      "Priority placement in search",
      "Full media gallery",
      "Advanced analytics",
    ],
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
    features: [
      "All Gold features",
      "Company logo on profile",
      "5 job posting credits ($100 value each)",
      "Business profile badge",
      "Priority placement in search",
      "Recruiter tools",
    ],
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
    features: [
      "All Gold Business features",
      "15 job posting credits ($1,500 value)",
      "Featured employer badge",
      "Top priority placement",
      "Dedicated account support",
      "Custom branding options",
    ],
  },
];

router.get("/memberships/plans", async (_req, res): Promise<void> => {
  res.json(PLANS);
});

router.post("/memberships/subscribe", async (req, res): Promise<void> => {
  const parsed = SubscribeMembershipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const plan = PLANS.find((p) => p.slug === parsed.data.planSlug);
  if (!plan) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const [subscription] = await db
    .insert(subscriptionsTable)
    .values({
      userId: parsed.data.userId,
      planSlug: parsed.data.planSlug,
      planName: plan.name,
      status: "active",
      startDate: new Date(),
      expiresAt,
      paypalOrderId: parsed.data.paypalOrderId,
    })
    .returning();

  await db
    .update(usersTable)
    .set({ planName: plan.name })
    .where(eq(usersTable.id, parsed.data.userId));

  res.status(201).json({
    ...subscription,
    startDate: subscription.startDate.toISOString(),
    expiresAt: subscription.expiresAt.toISOString(),
    createdAt: subscription.createdAt.toISOString(),
  });
});

router.get("/memberships/:userId", async (req, res): Promise<void> => {
  const params = GetUserMembershipParams.safeParse({ userId: Number(req.params.userId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [subscription] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, params.data.userId))
    .orderBy(subscriptionsTable.createdAt)
    .limit(1);

  if (!subscription) {
    res.status(404).json({ error: "No membership found" });
    return;
  }

  res.json({
    ...subscription,
    startDate: subscription.startDate.toISOString(),
    expiresAt: subscription.expiresAt.toISOString(),
    createdAt: subscription.createdAt.toISOString(),
  });
});

export default router;
