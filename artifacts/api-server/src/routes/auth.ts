import { Router } from "express";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { db, usersTable } from "@workspace/db";
import { recordAdminActivity } from "../lib/activity-log";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

router.post("/auth/sign-in", async (req, res): Promise<void> => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: "This account is inactive" });
    return;
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;

  if (user.role === "admin") {
    recordAdminActivity({
      actor: safeUser,
      action: "admin.sign_in",
      targetType: "auth",
      targetId: user.id,
      summary: "Admin signed in",
    });
  }

  res.json(safeUser);
});

router.post("/auth/clerk-sync", async (req, res): Promise<void> => {
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

  const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (existingUser) {
    if (!existingUser.isActive) {
      res.status(403).json({ error: "This account is inactive" });
      return;
    }

    const [updatedUser] = await db
      .update(usersTable)
      .set({
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
        profilePhotoUrl: profilePhotoUrl ?? existingUser.profilePhotoUrl,
      })
      .where(eq(usersTable.id, existingUser.id))
      .returning();

    const { passwordHash: _passwordHash, ...safeUser } = updatedUser ?? existingUser;
    res.json(safeUser);
    return;
  }

  const [createdUser] = await db
    .insert(usersTable)
    .values({
      email,
      passwordHash: hashPassword(`${clerkId}:${email}`),
      firstName: firstName || "MATR",
      lastName: lastName || "Member",
      profilePhotoUrl,
    })
    .returning();

  const { passwordHash: _passwordHash, ...safeUser } = createdUser;
  res.status(201).json(safeUser);
});

export default router;
