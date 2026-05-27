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
  const statusFilter = typeof req.query.status === "string" ? req.query.status : undefined;
  const includeAll = req.query.scope === "all";
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
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
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

  res.json(formatJob(job));
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
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
  const params = DeleteJobParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
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
