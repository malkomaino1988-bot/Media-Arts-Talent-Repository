import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db, usersTable, jobsTable, adsTable, subscriptionsTable } from "@workspace/db";

const router = Router();

router.get("/stats/overview", async (_req, res): Promise<void> => {
  const [userStats] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where is_active = true)`,
    })
    .from(usersTable);

  const [jobStats] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where status = 'active')`,
    })
    .from(jobsTable);

  const [adStats] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where status = 'active')`,
    })
    .from(adsTable);

  const planRevenue: Record<string, number> = {
    friend: 25,
    bronze: 50,
    silver: 100,
    gold: 250,
    "gold-business": 500,
    "platinum-business": 1000,
  };

  const subscriptions = await db
    .select({ planSlug: subscriptionsTable.planSlug })
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.status, "active"));

  const totalRevenue = subscriptions.reduce((sum: number, s: { planSlug: string }) => {
    return sum + (planRevenue[s.planSlug] ?? 0);
  }, 0);

  res.json({
    totalUsers: Number(userStats?.total ?? 0),
    activeUsers: Number(userStats?.active ?? 0),
    totalTalents: Number(userStats?.total ?? 0),
    totalJobs: Number(jobStats?.total ?? 0),
    activeJobs: Number(jobStats?.active ?? 0),
    totalAds: Number(adStats?.total ?? 0),
    activeAds: Number(adStats?.active ?? 0),
    totalRevenue,
  });
});

router.get("/stats/talent-types", async (_req, res): Promise<void> => {
  const users = await db
    .select({ talentTags: usersTable.talentTags })
    .from(usersTable)
    .where(eq(usersTable.isActive, true));

  const talentCounts: Record<string, number> = {};
  for (const user of users) {
    for (const tag of user.talentTags) {
      talentCounts[tag] = (talentCounts[tag] ?? 0) + 1;
    }
  }

  const result = Object.entries(talentCounts)
    .map(([talentType, count]) => ({ talentType, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  res.json(result);
});

router.get("/stats/membership-distribution", async (_req, res): Promise<void> => {
  const subscriptions = await db
    .select({
      planSlug: subscriptionsTable.planSlug,
      planName: subscriptionsTable.planName,
    })
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.status, "active"));

  const planRevenue: Record<string, number> = {
    friend: 25,
    bronze: 50,
    silver: 100,
    gold: 250,
    "gold-business": 500,
    "platinum-business": 1000,
  };

  const distribution: Record<string, { planName: string; count: number; revenue: number }> = {};
  for (const sub of subscriptions) {
    if (!distribution[sub.planSlug]) {
      distribution[sub.planSlug] = { planName: sub.planName, count: 0, revenue: 0 };
    }
    distribution[sub.planSlug].count += 1;
    distribution[sub.planSlug].revenue += planRevenue[sub.planSlug] ?? 0;
  }

  res.json(Object.values(distribution));
});

export default router;
