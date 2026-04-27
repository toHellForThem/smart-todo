import { io } from 'socket.io-client/dist/socket.io.js';


const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true,
});