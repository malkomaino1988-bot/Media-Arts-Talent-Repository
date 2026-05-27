import { Router } from "express";
import { and, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  CreateUserBody,
  UpdateUserBody,
  ListUsersQueryParams,
  GetUserParams,
  UpdateUserParams,
  DeleteUserParams,
} from "@workspace/api-zod";
import { createHash } from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

router.get("/users", async (req, res): Promise<void> => {
  const query = ListUsersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { page, limit, plan, search } = query.data;
  const offset = ((page ?? 1) - 1) * (limit ?? 20);

  const conditions: SQL<unknown>[] = [];
  if (plan) conditions.push(eq(usersTable.planName, plan));
  if (search) {
    conditions.push(
      or(
        ilike(usersTable.firstName, `%${search}%`),
        ilike(usersTable.lastName, `%${search}%`),
        ilike(usersTable.email, `%${search}%`),
      ) as SQL<unknown>,
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const users = await db
    .select()
    .from(usersTable)
    .where(whereClause)
    .limit(limit ?? 20)
    .offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(usersTable)
    .where(whereClause);

  const total = Number(totalResult[0]?.count ?? 0);

  res.json({
    users: users.map((u: typeof users[number]) => ({ ...u, passwordHash: undefined })),
    total,
    page: page ?? 1,
    limit: limit ?? 20,
  });
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { password, email, ...rest } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const [user] = await db
    .insert(usersTable)
    .values({
      ...rest,
      email,
      passwordHash: hashPassword(password),
    })
    .returning();

  const { passwordHash: _ph, ...safeUser } = user;
  res.status(201).json(safeUser);
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const { passwordHash: _ph, ...safeUser } = user;
  res.json(safeUser);
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const { passwordHash: _ph, ...safeUser } = user;
  res.json(safeUser);
});

router.delete("/users/:id", async (req, res): Promise<void> => {
  const params = DeleteUserParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db.delete(usersTable).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
