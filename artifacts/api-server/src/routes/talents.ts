import { Router } from "express";
import { eq, ilike, and, gte, lte, sql, or, type SQL } from "drizzle-orm";
import { db, usersTable, mediaTable } from "@workspace/db";
import { ListTalentsQueryParams, GetTalentParams } from "@workspace/api-zod";

const router = Router();

router.get("/talents/featured", async (_req, res): Promise<void> => {
  const featured = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      jobTitle: usersTable.jobTitle,
      city: usersTable.city,
      province: usersTable.province,
      planName: usersTable.planName,
      profilePhotoUrl: usersTable.profilePhotoUrl,
      talentTags: usersTable.talentTags,
      yearsExperience: usersTable.yearsExperience,
    })
    .from(usersTable)
    .where(
      and(
        eq(usersTable.isActive, true),
        eq(usersTable.role, "user"),
      ),
    )
    .orderBy(sql`CASE 
      WHEN plan_name = 'Platinum Business' THEN 1
      WHEN plan_name = 'Gold Business' THEN 2
      WHEN plan_name = 'Gold' THEN 3
      WHEN plan_name = 'Silver' THEN 4
      ELSE 5
    END`)
    .limit(8);

  res.json(featured);
});

router.get("/talents", async (req, res): Promise<void> => {
  const query = ListTalentsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const {
    page, limit, search, city, region, gender,
    minAge, maxAge, minExperience, maxExperience, talentType,
  } = query.data;

  const offset = ((page ?? 1) - 1) * (limit ?? 12);
  const conditions: SQL<unknown>[] = [
    eq(usersTable.isActive, true),
    eq(usersTable.role, "user"),
  ];

  if (search) {
    conditions.push(
      sql`(${usersTable.firstName} ILIKE ${`%${search}%`} OR ${usersTable.lastName} ILIKE ${`%${search}%`} OR ${usersTable.jobTitle} ILIKE ${`%${search}%`})` as ReturnType<typeof eq>,
    );
  }
  if (city) conditions.push(ilike(usersTable.city, `%${city}%`) as ReturnType<typeof eq>);
  if (region) conditions.push(ilike(usersTable.province, `%${region}%`) as ReturnType<typeof eq>);
  if (gender) conditions.push(eq(usersTable.gender, gender) as ReturnType<typeof eq>);
  if (minAge !== undefined) conditions.push(gte(usersTable.age, minAge) as ReturnType<typeof eq>);
  if (maxAge !== undefined) conditions.push(lte(usersTable.age, maxAge) as ReturnType<typeof eq>);
  if (minExperience !== undefined) conditions.push(gte(usersTable.yearsExperience, minExperience) as ReturnType<typeof eq>);
  if (maxExperience !== undefined) conditions.push(lte(usersTable.yearsExperience, maxExperience) as ReturnType<typeof eq>);
  if (talentType) {
    const talentTypes = talentType
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean);

    if (talentTypes.length === 1) {
      conditions.push(sql`${usersTable.talentTags} @> ARRAY[${talentTypes[0]}]::text[]`);
    } else if (talentTypes.length > 1) {
      conditions.push(or(...talentTypes.map((item: string) => sql`${usersTable.talentTags} @> ARRAY[${item}]::text[]`)) as SQL<unknown>);
    }
  }

  const whereClause = and(...conditions);

  const talents = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      jobTitle: usersTable.jobTitle,
      city: usersTable.city,
      province: usersTable.province,
      planName: usersTable.planName,
      profilePhotoUrl: usersTable.profilePhotoUrl,
      talentTags: usersTable.talentTags,
      yearsExperience: usersTable.yearsExperience,
    })
    .from(usersTable)
    .where(whereClause)
    .orderBy(sql`CASE 
      WHEN plan_name = 'Gold' OR plan_name = 'Gold Business' OR plan_name = 'Platinum Business' THEN 1
      ELSE 2
    END`, usersTable.createdAt)
    .limit(limit ?? 12)
    .offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(usersTable)
    .where(whereClause);

  res.json({
    talents,
    total: Number(totalResult[0]?.count ?? 0),
    page: page ?? 1,
    limit: limit ?? 12,
  });
});

router.get("/talents/:id", async (req, res): Promise<void> => {
  const params = GetTalentParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.id, params.data.id), eq(usersTable.isActive, true)));

  if (!user) {
    res.status(404).json({ error: "Talent not found" });
    return;
  }

  const media = await db.select().from(mediaTable).where(eq(mediaTable.userId, user.id));

  const { passwordHash: _ph, ...safeUser } = user;
  res.json({ ...safeUser, media });
});

export default router;
