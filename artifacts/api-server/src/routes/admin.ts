import { Router } from "express";
import { requireAdminUser } from "../lib/auth";
import { listAdminActivity } from "../lib/activity-log";

const router = Router();

router.get("/admin/activity", async (req, res): Promise<void> => {
  if (!(await requireAdminUser(req, res))) {
    return;
  }

  res.json(listAdminActivity());
});

export default router;
