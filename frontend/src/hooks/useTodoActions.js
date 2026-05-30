import { useState, useEffect, useCallback } from 'react';
import { TodoStorage, RpgStorage, AuthStorage } from '../utils/storage';
import { socket } from '../utils/socket';
import { getLogicalDateStr } from '../utils/date';

export const useTodoActions = (mainTab, settings) => {
  const [todoList, setTodoList] = useState(() => {
    const local = TodoStorage.getAll();
    const list = Array.isArray(local) ? local : [];

    // Offline/Startup reset check
    const localSettings = AuthStorage.getSettings();
    if (localSettings?.reset_enabled !== false) {
      const resetTimeStr = localSettings?.reset_time || '00:00';
      const parts = resetTimeStr.split(':').map(Number);
      const timeToReset = (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1]))
        ? [parts[0], parts[1], 0, 0]
        : [0, 0, 0, 0];

      let startOfToday = new Date().setHours(...timeToReset);
      if (startOfToday > Date.now()) {
        startOfToday -= 86400000;
      }

      let hasChanges = false;
      const updatedList = list.map(item => {
        if ((item.type === 'daily' || item.type === 'habit') && item.updatedAt < startOfToday) {
          hasChanges = true;
          return {
            ...item,
            progressNow: 0,
            completed: false,
            updatedAt: startOfToday
          };
        }
        return item;
      });

      if (hasChanges) {
        TodoStorage.saveAll(updatedList);
        return updatedList;
      }
    }

    return list;
  });
  const [rpgHistory, setRpgHistory] = useState(() => RpgStorage.getHistory());

  // Save todoList to local storage when changed
  useEffect(() => {
    const timer = setTimeout(() => {
      TodoStorage.saveAll(todoList);
    }, 1000);
    return () => clearTimeout(timer);
  }, [todoList]);

  // Save RPG history to local storage when changed
  useEffect(() => {
    RpgStorage.saveHistory(rpgHistory);
  }, [rpgHistory]);

  // Real-time reset timer
  useEffect(() => {
    let timerId;

    const scheduleNextReset = () => {
      const resetEnabled = settings?.reset_enabled !== false;
      if (!resetEnabled) return;

      const resetTimeStr = settings?.reset_time || '00:00';
      const parts = resetTimeStr.split(':').map(Number);
      const timeToReset = (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1]))
        ? [parts[0], parts[1], 0, 0]
        : [0, 0, 0, 0];

      const now = new Date();
      const tomorrow = new Date(now);

      tomorrow.setHours(...timeToReset);

      if (tomorrow <= now) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      let toUpdatedAt = Date.now();

      timerId = setTimeout(() => {
        toUpdatedAt = tomorrow.getTime();
        setTodoList(prev => prev.map(item =>
          item.type === 'daily' || item.type === 'habit'
            ? { ...item, progressNow: 0, completed: false, updatedAt: toUpdatedAt }
            : item
        ));
        socket.emit('client:confirm_reset', 'daily', toUpdatedAt);
        socket.emit('client:confirm_reset', 'habit', toUpdatedAt);

        scheduleNextReset();
      }, msUntilMidnight);
    };

    scheduleNextReset();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [settings]);

  // Auto-sync today's history when todoList changes
  useEffect(() => {
    // Find the maximum updatedAt of daily/habit tasks to avoid race conditions during resets
    const maxUpdatedAt = todoList.length > 0
      ? Math.max(...todoList.map(t => t.updatedAt || 0))
      : Date.now();
    const todayStr = getLogicalDateStr(settings?.reset_time, maxUpdatedAt);

    // Calculate current daily progress
    const dailies = todoList.filter(item => item.type === 'daily' && !item.deleted);
    let progress = 0.0;
    if (dailies.length > 0) {
      const { needProgress, nowProgress } = dailies.reduce((acc, item) => {
        const need = parseInt(item.progressEnd, 10) || 0;
        const now = parseInt(item.progressNow, 10) || 0;
        acc.needProgress += need;
        acc.nowProgress += now;
        return acc;
      }, { needProgress: 0, nowProgress: 0 });
      progress = needProgress > 0 ? nowProgress / needProgress : 0.0;
    }

    // Find today's habits points
    const positiveCount = todoList
      .filter(item => item.type === 'habit' && item.contribution === 1 && !item.deleted)
      .reduce((sum, h) => sum + (parseInt(h.progressNow, 10) || 0), 0);
    const negativeCount = todoList
      .filter(item => item.type === 'habit' && item.contribution === -1 && !item.deleted)
      .reduce((sum, h) => sum + (parseInt(h.progressNow, 10) || 0), 0);

    // Snapshot of today's active habits
    const habitsSnapshot = todoList
      .filter(item => item.type === 'habit' && !item.deleted)
      .map(item => ({
        id: item.id,
        text: item.text,
        contribution: item.contribution,
        progressNow: parseInt(item.progressNow, 10) || 0
      }));

    setRpgHistory(prev => {
      const existingEntry = prev.find(h => h.date === todayStr);
      const moodValue = existingEntry ? existingEntry.mood : null;

      const updatedEntry = {
        date: todayStr,
        mood: moodValue,
        daily_progress: progress,
        pos_points: positiveCount,
        neg_points: negativeCount,
        habits_detail: JSON.stringify(habitsSnapshot),
        updatedAt: Date.now()
      };

      // Check if anything has actually changed to avoid redundant updates
      if (
        existingEntry &&
        existingEntry.daily_progress === progress &&
        existingEntry.pos_points === positiveCount &&
        existingEntry.neg_points === negativeCount &&
        existingEntry.habits_detail === updatedEntry.habits_detail
      ) {
        return prev;
      }

      const existingIndex = prev.findIndex(h => h.date === todayStr);
      let newHistory;
      if (existingIndex !== -1) {
        newHistory = [...prev];
        newHistory[existingIndex] = updatedEntry;
      } else {
        newHistory = [...prev, updatedEntry];
      }

      socket.emit('client:sync_daily_history', updatedEntry);
      return newHistory;
    });
  }, [todoList, settings]);

  // --- TODO ACTIONS ---
  const addTask = useCallback((task, progressEnd = 1, type = mainTab, progressNow = 0, contribution = 0, days = '1111111') => {
    if (task.trim()) {
      let defaultContrib = contribution;
      if (defaultContrib === 0) {
        if (type === 'todo' || type === 'mainTab') defaultContrib = 1;
      }
      const newTodo = {
        id: Date.now().toString(),
        text: task.trim(),
        completed: false,
        deleted: false,
        updatedAt: Date.now(),
        type: type,
        progressNow: progressNow,
        progressEnd: progressEnd,
        contribution: defaultContrib,
        days: days,
      };
      setTodoList(prev => [newTodo, ...prev]);
      socket.emit('client:sync_todo', newTodo);
    }
  }, [mainTab]);

  const deleteToRecycle = useCallback((id) => {
    let updated = null;
    setTodoList(prev => {
      return prev.map(todo => {
        if (todo.id === id) {
          updated = { ...todo, deleted: true, updatedAt: Date.now() };
          return updated;
        }
        return todo;
      });
    });
    if (updated) {
      socket.emit('client:sync_todo', updated);
    }
  }, []);

  const statusChangeTask = useCallback((id, amount = 1, field = 'episode') => {
    let updated = null;
    setTodoList(prev => {
      return prev.map(todo => {
        if (todo.id === id) {
          const type = todo.type;

          if (type === 'habit') {
            if (amount === 'reset') {
              updated = {
                ...todo,
                progressNow: 0,
                updatedAt: Date.now()
              };
              return updated;
            }
            const change = Math.abs(amount);
            const newProgress = Math.max(0, (parseInt(todo.progressNow, 10) || 0) + change);
            updated = {
              ...todo,
              progressNow: newProgress,
              updatedAt: Date.now()
            };
            return updated;
          }

          if (type === 'piggy_bank') {
            const change = amount;
            const newProgress = Math.max(0, (parseInt(todo.progressNow, 10) || 0) + change);
            updated = {
              ...todo,
              progressNow: newProgress,
              completed: newProgress >= (parseInt(todo.progressEnd, 10) || 0),
              updatedAt: Date.now()
            };
            return updated;
          }

          if (type === 'tv_show') {
            if (amount === 'toggle_complete') {
              const wasCompleted = todo.completed;
              updated = {
                ...todo,
                completed: !wasCompleted,
                updatedAt: Date.now()
              };
              return updated;
            }
            let [season, episode] = (todo.progressNow || "1-1").toString().split('-').map(Number);
            if (isNaN(season)) season = 1;
            if (isNaN(episode)) episode = 1;

            const change = amount;
            if (field === 'season') {
              season = Math.max(1, season + change);
            } else {
              episode = Math.max(1, episode + change);
            }

            updated = {
              ...todo,
              progressNow: `${season}-${episode}`,
              updatedAt: Date.now()
            };
            return updated;
          }

          if (type === 'movie') {
            const wasCompleted = todo.completed;
            updated = {
              ...todo,
              completed: !wasCompleted,
              progressNow: !wasCompleted ? "1" : "0",
              updatedAt: Date.now()
            };
            return updated;
          }

          // Default behavior for other tasks (e.g. main/daily)
          if (todo.completed) {
            updated = {
              ...todo,
              progressNow: 0,
              completed: false,
              contribution: 0,
              updatedAt: Date.now()
            };
            return updated;
          } else {
            if (todo.progressEnd > 1) {
              const nextProgress = todo.progressNow + 1;
              const completed = nextProgress === todo.progressEnd;
              updated = {
                ...todo,
                progressNow: nextProgress,
                completed: completed,
                contribution: todo.type === 'daily' ? nextProgress : todo.contribution,
                updatedAt: Date.now()
              };
              return updated;
            }
            updated = {
              ...todo,
              progressNow: 1,
              completed: true,
              contribution: todo.type === 'daily' ? 1 : todo.contribution,
              updatedAt: Date.now()
            };
            return updated;
          }
        }
        return todo;
      });
    });
    if (updated) {
      socket.emit('client:sync_todo', updated);
    }
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodoList(prev => {
      const todoToDelete = prev.find(item => item.id === id);
      if (todoToDelete) {
        socket.emit('client:delete_todo', id);
      }
      return prev.filter(item => item.id !== id);
    });
  }, []);

  // --- RPG MOOD / DAILY HISTORY ACTIONS (Unified Calendar History logs) ---
  const handleMoodChange = useCallback((moodValue) => {
    const todayStr = getLogicalDateStr(settings?.reset_time);

    // Calculate current daily progress
    const dailies = todoList.filter(item => item.type === 'daily' && !item.deleted);
    let progress = 0.0;
    if (dailies.length > 0) {
      const { needProgress, nowProgress } = dailies.reduce((acc, item) => {
        acc.needProgress += (item.progressEnd || 0);
        acc.nowProgress += (item.progressNow || 0);
        return acc;
      }, { needProgress: 0, nowProgress: 0 });
      progress = nowProgress / needProgress;
    }

    // Find today's habits points
    const positiveCount = todoList
      .filter(item => item.type === 'habit' && item.contribution === 1 && !item.deleted)
      .reduce((sum, h) => sum + (parseInt(h.progressNow, 10) || 0), 0);
    const negativeCount = todoList
      .filter(item => item.type === 'habit' && item.contribution === -1 && !item.deleted)
      .reduce((sum, h) => sum + (parseInt(h.progressNow, 10) || 0), 0);

    // Snapshot of today's active habits
    const habitsSnapshot = todoList
      .filter(item => item.type === 'habit' && !item.deleted)
      .map(item => ({
        id: item.id,
        text: item.text,
        contribution: item.contribution,
        progressNow: parseInt(item.progressNow, 10) || 0
      }));

    setRpgHistory(prev => {
      const existingIndex = prev.findIndex(h => h.date === todayStr);
      const updatedEntry = {
        date: todayStr,
        mood: moodValue,
        daily_progress: progress,
        pos_points: positiveCount,
        neg_points: negativeCount,
        habits_detail: JSON.stringify(habitsSnapshot),
        updatedAt: Date.now()
      };

      let newHistory;
      if (existingIndex !== -1) {
        newHistory = [...prev];
        newHistory[existingIndex] = updatedEntry;
      } else {
        newHistory = [...prev, updatedEntry];
      }

      socket.emit('client:sync_daily_history', updatedEntry);
      return newHistory;
    });
  }, [todoList]);

  return {
    todoList,
    setTodoList,
    addTask,
    deleteToRecycle,
    statusChangeTask,
    deleteTodo,

    // RPG State
    rpgHistory,
    setRpgHistory,

    // RPG Actions
    handleMoodChange,
  };
};
