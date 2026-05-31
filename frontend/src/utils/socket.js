import { io } from 'socket.io-client/dist/socket.io.js';
import { AuthStorage } from './storage';

const getSocketUrl = () => {
  return AuthStorage.getServerUrl() || process.env.EXPO_PUBLIC_SOCKET_URL || '';
};

export const socket = io(getSocketUrl(), {
  transports: ['websocket'],
  autoConnect: true,
  auth: {
    username: AuthStorage.getUsername(),
    token: AuthStorage.getToken()
  }
});

export const updateSocketUrlAndReconnect = (newUrl) => {
  const url = newUrl?.trim();
  if (url) {
    AuthStorage.setServerUrl(url);
  } else {
    AuthStorage.setServerUrl('');
  }

  const targetUrl = url || process.env.EXPO_PUBLIC_SOCKET_URL || '';
  socket.io.uri = targetUrl;

  socket.disconnect();
  socket.connect();
};