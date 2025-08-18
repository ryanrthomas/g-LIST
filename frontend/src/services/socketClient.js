import { io } from "socket.io-client";

// Use your API base URL for the socket connection
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '')  || import.meta.env.VITE_API_BASE_URL_DEV?.replace('/api/v1', '');

let socket = null;

export function connectSocket(token) {
  console.log('Attempting to connect socket with token:', !!token);
  console.log('Socket URL:', SOCKET_URL);
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      transports: ["websocket","polling"],
    });
  }
  // Add connection event listeners for debugging
  socket.on('connect', () => {
    console.log('Socket connected successfully!');
  });
  
  socket.on('connect_error', (error) => {
    console.log('Socket connection error:', error.message);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
