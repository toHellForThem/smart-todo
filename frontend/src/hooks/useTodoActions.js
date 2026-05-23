import { useState, useEffect, useCallback } from 'react';
import { TodoStorage } from '../utils/storage';
import { socket } from '../utils/socket';

export const useTodoActions = (mainTab) => {
  const [todoList, setTodoList] = useState(() => TodoStorage.getAll());

  useEffect(() => {
    const timer = setTimeout(() => {
      TodoStorage.saveAll(todoList);
    }, 1000);
    return () => clearTimeout(timer);
  }, [todoList]);

  const addTask = useCallback((task, progressEnd = 1) => {
    if (task.trim()) {
      const newTodo = {
        id: Date.now().toString(),
        text: task,
        completed: false,
        deleted: false,
        updatedAt: Date.now(),
        type: mainTab,
        progressNow: 0,
        progressEnd: progressEnd,
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

  const statusChangeTask = useCallback((id) => {
    let updated = null;
    setTodoList(prev => {
      return prev.map(todo => {
        if (todo.id === id) {
          if (todo.completed) {
            updated = {
              ...todo,
              progressNow: 0,
              completed: false,
              updatedAt: Date.now()
            };
            return updated;
          } else {
            if (todo.progressEnd > 1) {
              const nextProgress = todo.progressNow + 1;
              updated = {
                ...todo,
                progressNow: nextProgress,
                completed: nextProgress === todo.progressEnd,
                updatedAt: Date.now()
              };
              return updated;
            }
            updated = {
              ...todo,
              progressNow: 1,
              completed: true,
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

  return {
    todoList,
    setTodoList,
    addTask,
    deleteToRecycle,
    statusChangeTask,
    deleteTodo,
  };
};
