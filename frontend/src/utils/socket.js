import { io } from 'socket.io-client/dist/socket.io.js';
import { AuthStorage } from './storage';


const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true,
  auth: {
    username: AuthStorage.getUsername(),
    token: AuthStorage.getToken()
  }
});