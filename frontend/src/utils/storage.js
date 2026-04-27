import { Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';


let storage = null;

if (Platform.OS !== 'web'){
    try {
    storage = createMMKV();
    } catch (e) {
    console.error("MMKV не смог инициализироваться:", e);
    }
}

export { storage };

export const TodoStorage = {
  saveAll: (todos) => {
    if (!storage) {
      localStorage.setItem('todo_list', JSON.stringify(todos));
      return;
    }
    storage.set('todo_list', JSON.stringify(todos));
  },
  
  getAll: () => {
    if (!storage) {
      const data = localStorage.getItem('todo_list');
      return data ? JSON.parse(data) : [];
    }
    const data = storage.getString('todo_list');
    return data ? JSON.parse(data) : [];
  }
};