import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, mediaTable } from "@workspace/db";
import { UploadMediaBody, GetUserMediaParams, DeleteMediaParams } from "@workspace/api-zod";
import { canAccessUser, requireAuthenticatedUser } from "../lib/auth";

const router = Router();

function formatMedia(m: typeof mediaTable.$inferSelect) {
  return {
    ...m,
    createdAt: m.createdAt.toISOString(),
  };
}

router.post("/media", async (req, res): Promise<void> => {
  const actor = await requireAuthenticatedUser(req, res);
  if (!actor) {
    return;
  }

  const parsed = UploadMediaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!canAccessUser(actor, parsed.data.userId)) {
    res.status(403).json({ error: "You can only add media to your own profile" });
    return;
  }

  const [media] = await db.insert(mediaTable).values(parsed.data).returning();
  res.status(201).json(formatMedia(media));
});

router.get("/media/:userId", async (req, res): Promise<void> => {
  const actor = await requireAuthenticatedUser(req, res);
  if (!actor) {
    return;
  }

  const params = GetUserMediaParams.safeParse({ userId: Number(req.params.userId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (!canAccessUser(actor, params.data.userId)) {
    res.status(403).json({ error: "You can only access your own media" });
    return;
  }

  const media = await db
    .select()
    .from(mediaTable)
    .where(eq(mediaTable.userId, params.data.userId))
    .orderBy(mediaTable.createdAt);

  res.json(media.map(formatMedia));
});

router.delete("/media/:id/delete", async (req, res): Promise<void> => {
  const actor = await requireAuthenticatedUser(req, res);
  if (!actor) {
    return;
  }

  const params = DeleteMediaParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existingMedia] = await db.select().from(mediaTable).where(eq(mediaTable.id, params.data.id));
  if (!existingMedia) {
    res.status(404).json({ error: "Media not found" });
    return;
  }

  if (actor.role !== "admin" && actor.id !== existingMedia.userId) {
    res.status(403).json({ error: "You can only delete your own media" });
    return;
  }

  const [media] = await db.delete(mediaTable).where(eq(mediaTable.id, params.data.id)).returning();
  if (!media) {
    res.status(404).json({ error: "Media not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
