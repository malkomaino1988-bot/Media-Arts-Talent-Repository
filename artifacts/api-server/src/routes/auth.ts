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

export default router;
