export type AdminActivityEntry = {
  id: string;
  actorId: number;
  actorName: string;
  action: string;
  targetType: "user" | "job" | "ad" | "auth";
  targetId: number | null;
  summary: string;
  details?: Record<string, string | number | boolean | null>;
  createdAt: string;
};

const MAX_ENTRIES = 250;
const entries: AdminActivityEntry[] = [];

export function recordAdminActivity(input: {
  actor: { id: number; firstName: string; lastName: string };
  action: string;
  targetType: AdminActivityEntry["targetType"];
  targetId: number | null;
  summary: string;
  details?: AdminActivityEntry["details"];
}): AdminActivityEntry {
  const entry: AdminActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actorId: input.actor.id,
    actorName: `${input.actor.firstName} ${input.actor.lastName}`.trim(),
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    summary: input.summary,
    details: input.details,
    createdAt: new Date().toISOString(),
  };

  entries.unshift(entry);
  if (entries.length > MAX_ENTRIES) {
    entries.length = MAX_ENTRIES;
  }

  return entry;
}

export function listAdminActivity(): AdminActivityEntry[] {
  return [...entries];
}
