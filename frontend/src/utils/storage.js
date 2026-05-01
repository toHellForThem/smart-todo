import { Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';


const nativeStorage = Platform.OS !== 'web' ? createMMKV() : null;

const core = {
  set: (key, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      nativeStorage.set(key, value);
    }
  },
  get: (key) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return nativeStorage.getString(key);
    }
  },
  remove: (key) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      nativeStorage.remove(key);
    }
  }
};

export { nativeStorage };

export const TodoStorage = {
  saveAll: (todos) => core.set('todo_list', JSON.stringify(todos)),
  getAll: () => {
    const data = core.get('todo_list');
    return data ? JSON.parse(data) : [];
  }
};

export const AuthStorage = {
  setUsername: (username) => core.set('username', username),
  getUsername: () => core.get('username'),

  setToken: (token) => core.set('user_token', token),
  getToken: () => core.get('user_token'),
  
  setSettings: (settings) => core.set('user_settings', JSON.stringify(settings)),
  getSettings: () => {
    const data = core.get('user_settings');
    return data ? JSON.parse(data) : { theme: 'dark' };
  },
  
  logout: () => {
    core.remove('username')
    core.remove('user_token');
    core.remove('user_settings');
  }
};