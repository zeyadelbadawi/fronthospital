// hooks/useSocket.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function useSocket(userId, onNotification) {
  const socketRef = useRef();

  useEffect(() => {
    if (!userId) return;

    // Connect to socket server
    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ["websocket"], // Optional but improves reliability
    });

    socketRef.current = socket;

    // Register user to identify them on the server
    socket.emit("register", userId);

    // Listen for new notifications
    socket.on("newNotification", (count,notification) => {
      if (onNotification) onNotification(count,notification);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, onNotification]);

  return socketRef.current;
}