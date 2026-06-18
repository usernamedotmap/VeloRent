import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { ENV } from "./config/env";
import { helmetConfig, hppProtection, requestSizeLimiter } from "./middleware/security";
import { webhookHandler } from "./controllers/payment.controller";
import cookieParser from "cookie-parser";
import { globalLimiter } from "./middleware/rateLimiter";
import userRoutes from "./routes/user.route";
import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin.route";
import bikeRoutes from "./routes/bike.route";
import reservationRoutes from "./routes/reservation.route";
import paymentRoutes from "./routes/payment.route";
import notificationRoutes from "./routes/notificationEvent.route";
import { errorHandler } from "./middleware/errorHandler";
import { connectDB } from "./config/db";
import { verifyMailer } from "./config/mailer";
import { getMqttClient } from "./config/mqtt";
import { initCronJobs } from "./services/cron.service";
import { initSocket } from "./config/socket";


const app = express();
const PATH = ENV.BASE_PATH;
const ORIGIN = ENV.FRONTEND_ORIGIN;

// security header
app.use(helmetConfig);
// cors here
app.use(
  cors({
    origin: ENV.IS_PROD ? "" : ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// pyamnet routeu but only webhooks
app.post(
  `${PATH}/payment/webhook`,
  express.raw({
    type: "*/*",
  }),
  webhookHandler,
);

// body parsing
app.use(express.json({ limit: "50kb" }));
// app.use(morgan("dev"));
app.use(
  express.urlencoded({
    extended: true,
    limit: "50kb",
  }),
);
app.use(cookieParser(ENV.COOKIE_SECRET));

// request sanitaztion
// app.use(mongoSanitizer);
app.use(hppProtection);
app.use(requestSizeLimiter);

// global rate litmiter
app.set("trust proxy", 1);
app.use(globalLimiter);

//csrf protection
// app.use(crsfProtection);

// user
app.use(`${PATH}/user`, userRoutes);
// auth
app.use(`${PATH}/auth`, authRoutes);
// admin
app.use(`${PATH}/admin`, adminRoutes);
// bike
app.use(`${PATH}/bike`, bikeRoutes);
// reservation
app.use(`${PATH}/reservation`, reservationRoutes);
// payment
app.use(`${PATH}/payment`, paymentRoutes);
// notification
app.use(`${PATH}/notifications`, notificationRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      environment: ENV.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

if (!ENV.IS_PROD) {
  app.post("/api/test/cron", async (req, res) => {
    const { runWarningCheck, runOverdueCheck } =
      await import("./services/cron.service");
    // Export these functions and call them directly
    runWarningCheck();
    runOverdueCheck();
    res.json({ triggered: true });
  });
} else {
  console.warn("Skipping test routes because IS_PROD is true");
}

app.use((req, res) => {
  res.status(404).json({
    success: true,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.path} not found`,
    },
  });
});

app.use(errorHandler);

const start = async () => {
  await connectDB();
  await verifyMailer();
  getMqttClient();
  initCronJobs();

  const httpServer = http.createServer(app);
  initSocket(httpServer);
  httpServer.listen(ENV.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${ENV.PORT}`);
    console.log(`📋 Health: http://localhost:${ENV.PORT}/api/health`);
  });
};

start();

export default app;
