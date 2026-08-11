import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// Derive the socket URL from the API URL (strip the trailing /api).
function socketUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

export function getSocket() {
  if (!socket) {
    socket = io(socketUrl(), { withCredentials: true, autoConnect: true });
  }
  return socket;
}
