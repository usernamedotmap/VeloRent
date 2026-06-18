  import { Router, Request, Response } from "express";
  import {
    runElapsedUpdate,
    runOverdueCheck,
    runWarningCheck,
  } from "../services/cron.service";
  import { processPendingNotifications } from "../services/notificationSender";
  import { ENV } from "../config/env";

  const conRoutes = Router();

  conRoutes.get("/execute-checks", async (req: Request, res: Response) => {
    if (req.headers["x-cron-key"] !== ENV.CRON_SECRET_KEY) {
      return res.status(401).send("Unauthorized");
    }

    try {
      console.log(
        `[EXTERNAL CRON] Triggered checks at ${new Date().toISOString()}`,
      );

      await runWarningCheck();
      await runOverdueCheck();
      await runElapsedUpdate();
      await processPendingNotifications();

      res.status(200).send('Checks executed successfully');
    } catch (err) {
      res.status(500).send('Cron task failed');
    }
  });

  export default conRoutes;