import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, mediaTable } from "@workspace/db";
import { UploadMediaBody, GetUserMediaParams, DeleteMediaParams } from "@workspace/api-zod";

const router = Router();

function formatMedia(m: typeof mediaTable.$inferSelect) {
  return {
    ...m,
    createdAt: m.createdAt.toISOString(),
  };
}

router.post("/media", async (req, res): Promise<void> => {
  const parsed = UploadMediaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [media] = await db.insert(mediaTable).values(parsed.data).returning();
  res.status(201).json(formatMedia(media));
});

router.get("/media/:userId", async (req, res): Promise<void> => {
  const params = GetUserMediaParams.safeParse({ userId: Number(req.params.userId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
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
  const params = DeleteMediaParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
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
