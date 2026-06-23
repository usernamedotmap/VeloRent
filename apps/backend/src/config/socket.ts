import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { ENV } from "./env";
import { verifyAccessToken } from "../utils/jwt";
import { DashboardNotificationEvent, NotificationRecipientRole } from "../models";

export let io: SocketServer;

export type SocketEvent =
  | "notification:new-reservation"
  | "notification:overdue"
  | "notification:payment-confirmed"
  | "notification:ride-warning";

export interface SocketNotification {
  id: string;
  type: SocketEvent;
  title: string;
  message: string;
  reservationId?: string;
  timestamp: string;
  role: "admin" | "operator" | "both";
  metadata?: Record<string, unknown>;
  isRead?: boolean;
}

export interface CreateNotificationInput {
  recipientRole: NotificationRecipientRole | "both";
  recipientId?: string;
  event: DashboardNotificationEvent;
  title: string;
  message: string;
  reservationId?: string; 
  metadata?: Record<string, unknown>;
}

export type EmitNotificationInput = {
  title: string;
  message: string;
  reservationId?: string;
  metadata?: Record<string, unknown>;
  isRead?:   boolean;
  timestamp?: string;
}

export const initSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: ENV.IS_PROD
        ? ENV.FRONTEND_ORIGIN
        : ["http://localhost:1573", "http://localhost:3000"],
      credentials: true,
    },
    // websoker una, then polling
    transports: ["websocket", "polling"],
  });

  // auth midd
  io.use((socket, next) => {
    try {
      let token: string | null = null; 
     
     
      // read cookie
      const cookie = socket.handshake.headers.cookie ?? '';
      token = extractTokenFromCookie(cookie, "accessToken");

      if (!token && socket.handshake.auth?.token) {
        token = socket.handshake.auth.token as string;
      }

      if (!token) {
        const authHeader = socket.handshake.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1];
        }
      }

      if (!token) {
        return next(new Error('NO_TOKEN'));
      }

      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      next();
    } catch (err: any) {
      console.log('[SOCKET] Auth error', err.message);
      next(new Error("INVALID_TOKEN"));
    }
  });

  // connection handler
  io.on("connection", (socket: Socket) => {
    const { userId, role } = socket.data.user;


    // join role
    socket.join(role);
    if (role === "admin") {
      socket.join("operator"); // dapata admin can see notif ng oper
    }

    // join personal room
    socket.join(`user:${userId}`);

    socket.on("disconnect", () => {
      console.log(`[SOCKET] Disconneted: ${userId}`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

// emit natino for role room
export const emitToRole = (
    role:  'admin' | 'operator' | 'both',
    event: SocketEvent,
    notification: EmitNotificationInput
) => {
    if (!io) return;

    const payload: SocketNotification = {
        id: crypto.randomUUID(),
        type: event,
        role,
        title: notification.title,
        message: notification.message,
        reservationId: notification.reservationId,
        metadata: notification.metadata,
        timestamp: notification.timestamp ?? new Date().toISOString() ,
    };

    if (role === 'both') {
        io.to('admin').to('operator').emit(event, payload);
    } else {
        io.to(role).emit(event, payload);
    }

    console.log(`[SOCKET] Emitted ${event} to ${role}`);
};


// cookie helper
const extractTokenFromCookie = (
    cookieStr: string,
    name: string,
): string | null => {
  if (!cookieStr) return null;

  const pairs = cookieStr.split(';').map((p) => p.trim());
  const match = pairs.find((p) => p.startsWith(`${name}=`));
  if (!match) return null;
  const value = match.split('=').slice(1).join('=');
  return decodeURIComponent(value);
};

export const emitToSocket = (
  socketId: string,
  event:    string,
  data:     Record<string, unknown>
) => {
  if (!io) return;
  io.to(socketId).emit(event, data);
  console.log(`[SOCKET] Emitted ${event} to socket ${socketId}`);
};