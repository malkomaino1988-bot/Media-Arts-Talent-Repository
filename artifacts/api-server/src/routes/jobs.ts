import { Router } from "express";
import { eq, ilike, and, sql } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import {
  CreateJobBody,
  UpdateJobBody,
  ListJobsQueryParams,
  GetJobParams,
  UpdateJobParams,
  DeleteJobParams,
} from "@workspace/api-zod";
import { getOptionalAuthenticatedUser, requireAuthenticatedUser } from "../lib/auth";

const router = Router();

function formatJob(job: typeof jobsTable.$inferSelect) {
  return {
    ...job,
    expiresAt: job.expiresAt.toISOString(),
    createdAt: job.createdAt.toISOString(),
    updatedAt: (job as Record<string, unknown>).updatedAt
      ? new Date((job as Record<string, unknown>).updatedAt as Date).toISOString()
      : undefined,
  };
}

router.get("/jobs", async (req, res): Promise<void> => {
  const query = ListJobsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { page, limit, search, city, category } = query.data;
  const offset = ((page ?? 1) - 1) * (limit ?? 10);
  const actor = await getOptionalAuthenticatedUser(req);
  const statusFilter = typeof req.query.status === "string" ? req.query.status : undefined;
  const includeAll = req.query.scope === "all" && actor?.role === "admin";
  const conditions: ReturnType<typeof eq>[] = [];

  if (!includeAll) {
    conditions.push(eq(jobsTable.status, "active"));
  } else if (statusFilter === "active" || statusFilter === "draft" || statusFilter === "expired") {
    conditions.push(eq(jobsTable.status, statusFilter));
  }

  if (search) {
    conditions.push(
      sql`(${jobsTable.title} ILIKE ${`%${search}%`} OR ${jobsTable.company} ILIKE ${`%${search}%`} OR ${jobsTable.description} ILIKE ${`%${search}%`})` as ReturnType<typeof eq>,
    );
  }
  if (city) conditions.push(ilike(jobsTable.city, `%${city}%`) as ReturnType<typeof eq>);
  if (category) conditions.push(eq(jobsTable.category, category) as ReturnType<typeof eq>);

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const jobs = await db
    .select()
    .from(jobsTable)
    .where(whereClause)
    .orderBy(jobsTable.createdAt)
    .limit(limit ?? 10)
    .offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(jobsTable)
    .where(whereClause);

  res.json({
    jobs: jobs.map(formatJob),
    total: Number(totalResult[0]?.count ?? 0),
    page: page ?? 1,
    limit: limit ?? 10,
  });
});

router.post("/jobs", async (req, res): Promise<void> => {
  const actor = await requireAuthenticatedUser(req, res);
  if (!actor) {
    return;
  }

  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (actor.role !== "admin" && actor.id !== parsed.data.userId) {
    res.status(403).json({ error: "You can only create jobs for your own account" });
    return;
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 60);

  const [job] = await db
    .insert(jobsTable)
    .values({
      ...parsed.data,
      status: "active",
      expiresAt,
    })
    .returning();

  res.status(201).json(formatJob(job));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (job.status !== "active") {
    const actor = await requireAuthenticatedUser(req, res);
    if (!actor) {
      return;
    }

    if (actor.role !== "admin" && actor.id !== job.userId) {
      res.status(403).json({ error: "You do not have access to this job" });
      return;
    }
  }

  res.json(formatJob(job));
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const actor = await requireAuthenticatedUser(req, res);
  if (!actor) {
    return;
  }

  const params = UpdateJobParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existingJob] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!existingJob) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (actor.role !== "admin" && actor.id !== existingJob.userId) {
    res.status(403).json({ error: "You can only update your own jobs" });
    return;
  }

  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [job] = await db
    .update(jobsTable)
    .set(parsed.data)
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(formatJob(job));
});

router.delete("/jobs/:id", async (req, res): Promise<void> => {
  const actor = await requireAuthenticatedUser(req, res);
  if (!actor) {
    return;
  }

  const params = DeleteJobParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existingJob] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!existingJob) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (actor.role !== "admin" && actor.id !== existingJob.userId) {
    res.status(403).json({ error: "You can only delete your own jobs" });
    return;
  }

  const [job] = await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id)).returning();
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
