import { useEffect } from 'react';
import { InteractionManager } from 'react-native';
import { socket } from '../utils/socket';
import { AuthStorage } from '../utils/storage';

const timeToReset = [18, 45, 0, 0];

export const useTodoSocket = (setTodoList, setAuthMode, setAuthState) => {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Server!');
    });

    socket.on('server:login_success', (data) => {
      const { username, token, settings } = data;
      socket.emit('client:get_todos');
      setAuthMode('auth');
      setAuthState('');
      AuthStorage.setUsername(username);
      AuthStorage.setToken(token);
      AuthStorage.setSettings(settings);
    });

    socket.on('server:all_todos', (serverTodos) => {
      InteractionManager.runAfterInteractions(() => {
        let startOfToday = new Date().setHours(...timeToReset);
        let needEmitReset = false;

        if (startOfToday > Date.now()) {
          startOfToday -= 86400000;
        }
        setTodoList(localTodos => {
          const merged = [...localTodos];
          let hasChanges = false;

          serverTodos.forEach(sItem => {
            let processedItem = { ...sItem };

            if (processedItem.type === 'daily' && processedItem.updatedAt < startOfToday) {
              processedItem.progressNow = 0;
              processedItem.completed = false;
              processedItem.updatedAt = startOfToday;
              needEmitReset = true;
            }

            const localIndex = merged.findIndex(l => l.id === processedItem.id);
            if (localIndex === -1) {
              merged.push(processedItem);
              hasChanges = true;
            } else {
              const lItem = merged[localIndex];
              if (processedItem.updatedAt > (lItem.updatedAt || 0)) {
                merged[localIndex] = processedItem;
                hasChanges = true;
              } else if ((lItem.updatedAt || 0) > processedItem.updatedAt) {
                socket.emit('client:sync_todo', lItem);
              }
            }
          });
          return hasChanges ? merged : localTodos;
        });
        if (needEmitReset) {
          socket.emit('client:confirm_reset', 'daily');
        }
      });
    });

    socket.on('server:todo_updated', (updatedTodo) => {
      InteractionManager.runAfterInteractions(() => {
        setTodoList(prev => {
          const index = prev.findIndex(t => t.id === updatedTodo.id);
          if (index !== -1) {
            const existing = prev[index];
            if (updatedTodo.updatedAt > (existing.updatedAt || 0)) {
              const newList = [...prev];
              newList[index] = updatedTodo;
              return newList;
            }
            return prev;
          }
          return [...prev, updatedTodo];
        });
      });
    });

    socket.on('server:todo_deleted', (deletedId) => {
      InteractionManager.runAfterInteractions(() => {
        setTodoList(prev => prev.filter(todo => todo.id !== deletedId));
      });
    });

    socket.on('server:register_success', () => {
      InteractionManager.runAfterInteractions(() => {
        setAuthMode('');
        setAuthState('login');
      });
    });

    return () => {
      socket.off('connect');
      socket.off('server:all_todos');
      socket.off('server:todo_updated');
      socket.off('server:todo_deleted');
      socket.off('server:login_success');
      socket.off('server:register_success');
    };
  }, [setTodoList, setAuthMode, setAuthState]);
};
