import { Router, type IRouter } from "express";
import { hasDatabase } from "@workspace/db";

const router: IRouter = Router();
const { default: supportRouter } = await import("./support");

router.use(supportRouter);

if (hasDatabase) {
  const [
    { default: healthRouter },
    { default: authRouter },
    { default: adminRouter },
    { default: usersRouter },
    { default: talentsRouter },
    { default: membershipsRouter },
    { default: jobsRouter },
    { default: adsRouter },
    { default: mediaRouter },
    { default: statsRouter },
  ] = await Promise.all([
    import("./health"),
    import("./auth"),
    import("./admin"),
    import("./users"),
    import("./talents"),
    import("./memberships"),
    import("./jobs"),
    import("./ads"),
    import("./media"),
    import("./stats"),
  ]);

  router.use(healthRouter);
  router.use(authRouter);
  router.use(adminRouter);
  router.use(usersRouter);
  router.use(talentsRouter);
  router.use(membershipsRouter);
  router.use(jobsRouter);
  router.use(adsRouter);
  router.use(mediaRouter);
  router.use(statsRouter);
} else {
  const { default: demoRouter } = await import("./demo");
  router.use(demoRouter);
}

export default router;
