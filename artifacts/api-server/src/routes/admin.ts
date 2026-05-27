import { Router } from "express";
import { listAdminActivity } from "../lib/activity-log";

const router = Router();

router.get("/admin/activity", async (req, res): Promise<void> => {
  res.json(listAdminActivity());
});

export default router;
