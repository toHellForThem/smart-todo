import { useEffect, startTransition } from 'react';
import Toast from 'react-native-toast-message';
import { socket } from '../utils/socket';
import { AuthStorage, RpgStorage } from '../utils/storage';

const timeToReset = [18, 45, 0, 0];

export const useTodoSocket = (setTodoList, setAuthMode, setAuthState, setRpgHistory, setSettings, settings) => {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Server!');
    });

    socket.on('server:login_success', (data) => {
      const { username, token, settings: serverSettings } = data;
      socket.emit('client:get_todos');
      
      // Smart Month History Loading: only fetch if not already present in storage
      const curMonth = new Date().toISOString().split('T')[0].substring(0, 7);
      const localHistory = RpgStorage.getHistory();
      const hasMonthCached = localHistory.some(log => log.date.startsWith(curMonth));
      if (!hasMonthCached) {
        socket.emit('client:get_month_history', curMonth);
      }
      
      setAuthMode('auth');
      setAuthState('');
      AuthStorage.setUsername(username);
      AuthStorage.setToken(token);
      AuthStorage.setSettings(serverSettings);
      setSettings(serverSettings);
    });

    socket.on('server:all_todos', (serverTodos) => {
      const resetTimeStr = settings?.reset_time || '18:45';
      const parts = resetTimeStr.split(':').map(Number);
      const timeToReset = (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1]))
        ? [parts[0], parts[1], 0, 0]
        : [18, 45, 0, 0];

      let startOfToday = new Date().setHours(...timeToReset);
      const resetTypes = new Set();

      if (startOfToday > Date.now()) {
        startOfToday -= 86400000;
      }

      startTransition(() => {
        setTodoList(localTodos => {
          const merged = [...localTodos];
          let hasChanges = false;

          serverTodos.forEach(sItem => {
            let processedItem = { ...sItem };

            if (settings?.reset_enabled !== false && (processedItem.type === 'daily' || processedItem.type === 'habit') && processedItem.updatedAt < startOfToday) {
              processedItem.progressNow = 0;
              processedItem.completed = false;
              processedItem.updatedAt = startOfToday;
              resetTypes.add(processedItem.type);
              hasChanges = true;
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
      });

      if (resetTypes.size > 0) {
        resetTypes.forEach(type => {
          socket.emit('client:confirm_reset', type, startOfToday);
        });
      }
    });

    socket.on('server:todo_updated', (updatedTodo) => {
      startTransition(() => {
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
      startTransition(() => {
        setTodoList(prev => prev.filter(todo => todo.id !== deletedId));
      });
    });

    socket.on('server:register_success', () => {
      startTransition(() => {
        setAuthMode('');
        setAuthState('login');
      });
    });

    socket.on('server:auth_expired', () => {
      startTransition(() => {
        AuthStorage.logout();
        setAuthMode('local');
        setAuthState('login');
        Toast.show({
          type: 'error',
          text1: 'Сессия истекла',
          text2: 'Пожалуйста, авторизуйтесь заново',
          visibilityTime: 4000
        });
      });
    });

    socket.on('server:month_history', (data) => {
      startTransition(() => {
        if (data && data.history) {
          setRpgHistory(prev => {
            // merge server month logs with local logs
            const merged = [...prev];
            data.history.forEach(srvLog => {
              const localIdx = merged.findIndex(h => h.date === srvLog.date);
              if (localIdx === -1) {
                merged.push(srvLog);
              } else {
                merged[localIdx] = srvLog;
              }
            });
            return merged;
          });
        }
      });
    });

    socket.on('server:daily_history_updated', (data) => {
      startTransition(() => {
        setRpgHistory(prev => {
          const index = prev.findIndex(h => h.date === data.date);
          if (index !== -1) {
            const newList = [...prev];
            newList[index] = data;
            return newList;
          }
          return [...prev, data];
        });
      });
    });

    return () => {
      socket.off('connect');
      socket.off('server:all_todos');
      socket.off('server:todo_updated');
      socket.off('server:todo_deleted');
      socket.off('server:login_success');
      socket.off('server:register_success');
      socket.off('server:auth_expired');
      socket.off('server:month_history');
      socket.off('server:daily_history_updated');
    };
  }, [setTodoList, setAuthMode, setAuthState, setRpgHistory, setSettings, settings]);
};
