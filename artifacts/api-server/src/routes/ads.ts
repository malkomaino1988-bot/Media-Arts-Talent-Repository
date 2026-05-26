import { Router } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, adsTable } from "@workspace/db";
import {
  CreateAdBody,
  UpdateAdBody,
  ListAdsQueryParams,
  UpdateAdParams,
  DeleteAdParams,
} from "@workspace/api-zod";
import { getOptionalAuthenticatedUser, requireAuthenticatedUser } from "../lib/auth";
import { recordAdminActivity } from "../lib/activity-log";

const router = Router();

const PLACEMENT_PRICES: Record<string, number> = {
  sidebar: 30,
  footer: 15,
};

function formatAd(ad: typeof adsTable.$inferSelect) {
  return {
    ...ad,
    priceMonthly: Number(ad.priceMonthly),
    startDate: ad.startDate.toISOString(),
    expiresAt: ad.expiresAt.toISOString(),
    createdAt: ad.createdAt.toISOString(),
  };
}

router.get("/ads", async (req, res): Promise<void> => {
  const query = ListAdsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const actor = await getOptionalAuthenticatedUser(req);
  const { placement, active } = query.data;
  const conditions: ReturnType<typeof eq>[] = [];

  if (placement) conditions.push(eq(adsTable.placement, placement));
  if (actor?.role !== "admin") {
    if (!actor) {
      conditions.push(eq(adsTable.status, "active"));
    } else {
      conditions.push(eq(adsTable.userId, actor.id));
    }
  } else if (active !== undefined) {
    conditions.push(eq(adsTable.status, active ? "active" : "inactive"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const ads = await db.select().from(adsTable).where(whereClause).orderBy(adsTable.createdAt);
  res.json(ads.map(formatAd));
});

router.post("/ads", async (req, res): Promise<void> => {
  const actor = await requireAuthenticatedUser(req, res);
  if (!actor) {
    return;
  }

  const parsed = CreateAdBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (actor.role !== "admin" && actor.id !== parsed.data.userId) {
    res.status(403).json({ error: "You can only create ads for your own account" });
    return;
  }

  const priceMonthly = PLACEMENT_PRICES[parsed.data.placement] ?? 30;
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const [ad] = await db
    .insert(adsTable)
    .values({
      ...parsed.data,
      priceMonthly: String(priceMonthly),
      status: "active",
      impressions: 0,
      clicks: 0,
      startDate: new Date(),
      expiresAt,
    })
    .returning();

  res.status(201).json(formatAd(ad));
});

router.patch("/ads/:id", async (req, res): Promise<void> => {
  const actor = await requireAuthenticatedUser(req, res);
  if (!actor) {
    return;
  }

  const params = UpdateAdParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existingAd] = await db.select().from(adsTable).where(eq(adsTable.id, params.data.id));
  if (!existingAd) {
    res.status(404).json({ error: "Ad not found" });
    return;
  }

  if (actor.role !== "admin" && actor.id !== existingAd.userId) {
    res.status(403).json({ error: "You can only update your own ads" });
    return;
  }

  const parsed = UpdateAdBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ad] = await db
    .update(adsTable)
    .set(parsed.data)
    .where(eq(adsTable.id, params.data.id))
    .returning();

  if (!ad) {
    res.status(404).json({ error: "Ad not found" });
    return;
  }

  if (actor.role === "admin") {
    recordAdminActivity({
      actor,
      action: "ad.updated",
      targetType: "ad",
      targetId: ad.id,
      summary: `Updated ${ad.placement} ad`,
      details: {
        status: ad.status,
      },
    });
  }

  res.json(formatAd(ad));
});

router.delete("/ads/:id", async (req, res): Promise<void> => {
  const actor = await requireAuthenticatedUser(req, res);
  if (!actor) {
    return;
  }

  const params = DeleteAdParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existingAd] = await db.select().from(adsTable).where(eq(adsTable.id, params.data.id));
  if (!existingAd) {
    res.status(404).json({ error: "Ad not found" });
    return;
  }

  if (actor.role !== "admin" && actor.id !== existingAd.userId) {
    res.status(403).json({ error: "You can only delete your own ads" });
    return;
  }

  const [ad] = await db.delete(adsTable).where(eq(adsTable.id, params.data.id)).returning();
  if (!ad) {
    res.status(404).json({ error: "Ad not found" });
    return;
  }

  if (actor.role === "admin") {
    recordAdminActivity({
      actor,
      action: "ad.deleted",
      targetType: "ad",
      targetId: ad.id,
      summary: `Deleted ${ad.placement} ad`,
    });
  }

  res.sendStatus(204);
});

export default router;
