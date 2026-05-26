import { createHmac, timingSafeEqual } from "crypto";
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

type SafeUser = Omit<typeof usersTable.$inferSelect, "passwordHash">;

const AUTH_SECRET = process.env.AUTH_SECRET || "matr-dev-secret";
const TOKEN_VERSION = "v1";

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string): string {
  return createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
}

function omitPasswordHash(user: typeof usersTable.$inferSelect): SafeUser {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export function createAccessToken(user: typeof usersTable.$inferSelect): string {
  const payload = encodeBase64Url(JSON.stringify({
    version: TOKEN_VERSION,
    userId: user.id,
    issuedAt: Date.now(),
  }));
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function readBearerToken(req: Request): string | null {
  const value = req.headers.authorization;
  if (!value || !value.startsWith("Bearer ")) {
    return null;
  }

  return value.slice("Bearer ".length).trim() || null;
}

async function resolveUserFromToken(token: string | null): Promise<SafeUser | null> {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as { userId?: number };
    if (!parsed.userId) {
      return null;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parsed.userId));
    if (!user || !user.isActive) {
      return null;
    }

    return omitPasswordHash(user);
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(req: Request): Promise<SafeUser | null> {
  const token = readBearerToken(req);
  return resolveUserFromToken(token);
}

export async function getOptionalAuthenticatedUser(req: Request): Promise<SafeUser | null> {
  return getAuthenticatedUser(req);
}

export async function requireAuthenticatedUser(req: Request, res: Response): Promise<SafeUser | null> {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }

  return user;
}

export async function requireAdminUser(req: Request, res: Response): Promise<SafeUser | null> {
  const user = await requireAuthenticatedUser(req, res);
  if (!user) {
    return null;
  }

  if (user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return null;
  }

  return user;
}

export function canAccessUser(actor: SafeUser, userId: number): boolean {
  return actor.role === "admin" || actor.id === userId;
}

export type AuthenticatedUser = SafeUser;
