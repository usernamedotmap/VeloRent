import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
  if (socket?.connected) return socket;

  const getTokenFromCookie = (): string | null => {
    const match = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("accessToken="));
    return match ? decodeURIComponent(match.split("=")[1]) : null;
  };

  socket = io(import.meta.env.VITE_API_SOCKET_URL ?? "http://localhost:4000", {
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,

    // send token to header
    auth: {
      token: getTokenFromCookie(),
    },
  });

  socket.on("connect", () => {
    console.log("[SOCKET] Connected:");
  });

  socket.on("connect_error", (err) => {
    console.log("[SOCKET] Connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("[SOCKET] Disconnected:", reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;
