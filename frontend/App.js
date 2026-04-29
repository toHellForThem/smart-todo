import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import {
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Pressable,
  ViewBase,
  InteractionManager,
  Animated,
  StyleSheet
} from 'react-native';
import { SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import ReAnimated, { 
  useAnimatedProps,
  useAnimatedStyle, 
  useDerivedValue,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate
} from 'react-native-reanimated';
import axios from 'axios';
import { styles } from './styles';
import { TodoStorage } from './src/utils/storage';
import { socket } from './src/utils/socket';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const MAX_PULL = 400;
const emojis = ['😫', '🙁', '😐', '🙂', '😎'];

const API_URL = `${process.env.EXPO_PUBLIC_SOCKET_URL}/todos`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 1000,
});

export default function App() {
  const translateY = useSharedValue(0);
  const [task, setTask] = useState('');
  const [todoList, setTodoList] = useState(() => TodoStorage.getAll());
  const [currentTab, setCurrentTab] = useState('todo');
  const context = useSharedValue(0);
  const isActive = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      let newValue = context.value + event.translationY;

      if (newValue < 0) newValue = 0;
      if (newValue > MAX_PULL) newValue = MAX_PULL;
      translateY.value = newValue;
    })
    .onEnd((event) => {
      const swipeVelocity = event.velocityY;
      if (swipeVelocity > 500 || event.translationY > MAX_PULL * 0.4) {
        translateY.value = withSpring(MAX_PULL);
        isActive.value = 1;
      } else if (swipeVelocity < -500 || event.translationY < -100) {
        translateY.value = withSpring(0);
        isActive.value = 0;
      } else {
        if(translateY.value > MAX_PULL / 2){
          translateY.value = withSpring(MAX_PULL)
          isActive.value = 1;
        } else {
          translateY.value = withSpring(0)
          isActive.value = 0;
        }
      }
    });
    

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === 5) {
      if (translateY.value > 100) { 
        translateY.value = withSpring(MAX_PULL);
      } else {
        translateY.value = withSpring(0);
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const tailStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(isActive.value === 1 ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0)'),
    pointerEvents: isActive.value === 1 ? 'auto' : 'none',
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            translateY.value,
            [0, MAX_PULL],
            [-400, 0]
          ),
        },
      ],
    };
  });

  const contentPointerEvents = useDerivedValue(() => {
    return translateY.value > 20 ? 'auto' : 'none';
  });

  const animatedContentProps = useAnimatedProps(() => ({
    pointerEvents: contentPointerEvents.value,
  }));

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Server!');
    });

    InteractionManager.runAfterInteractions(() => {
      socket.on('server:all_todos', (serverTodos) => {
        setTodoList(localTodos => {
          const merged = [...localTodos];
          let hasChanges = false;
          serverTodos.forEach(sItem => {
            const localIndex = merged.findIndex(l => l.id === sItem.id);
            if (localIndex === -1) {
              merged.push(sItem);
              hasChanges = true;
            } else {
              const lItem = merged[localIndex];
              if (sItem.updatedAt > (lItem.updatedAt || 0)) {
                merged[localIndex] = sItem;
                hasChanges = true;
              } else if ((lItem.updatedAt || 0) > sItem.updatedAt) {
                socket.emit('client:sync_todo', lItem);
              }
            }
          });
          return hasChanges ? [...merged] : localTodos;
        });
      });
    });

    InteractionManager.runAfterInteractions(() => {
      socket.on('server:todo_updated', (updatedTodo) => {
        setTodoList(prev => {
          const existing = prev.find(t => t.id === updatedTodo.id);
          if (!existing || updatedTodo.updatedAt > (existing.updatedAt || 0)) {
            return prev.map(t => t.id === updatedTodo.id ? updatedTodo : t);
          }
          return prev;
        });
      });
    });
    
    return () => {
      socket.off('connect');
      socket.off('server:all_todos');
      socket.off('server:todo_updated');
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      TodoStorage.saveAll(todoList);
    }, 1000);
  }, [todoList]);

  const addTask = useCallback(()=> {
  if (task.trim().length > 0) {
    const newTodo = { 
      id: Date.now().toString(), 
      text: task,
      completed: false,
      deleted: false,
      updatedAt: Date.now()
    };
    setTodoList(prev => [newTodo, ...prev]);
    setTask('');
    socket.emit('client:sync_todo', newTodo);
  }
}, [task])

  const deleteToRecycle = useCallback((id) => {
    setTodoList(prev => {
      return prev.map(todo => {
        if (todo.id === id) {
          const updated = { ...todo, deleted: true, updatedAt: Date.now() };
          socket.emit('client:sync_todo', updated);
          return updated;
        }
        return todo;
      });
    });
  },[])

  const statusChangeTask = useCallback((id) => {
    setTodoList(prev => {
      return prev.map(todo => {
        if (todo.id === id) {
          const updated = { ...todo, completed: !todo.completed, updatedAt: Date.now() };
          socket.emit('client:sync_todo', updated);
          return updated;
        }
        return todo;
      });
    });
  },[])

  const deleteTodo = useCallback(async (id) => {
    setTodoList(prev => prev.filter(item => item.id !== id));
  });

  const restoreFromRecycle = (id) => {
    setTodoList(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, deleted: false } : todo
      )
    );
  };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity><Text style={styles.icon}>⭐</Text></TouchableOpacity>
            <GestureDetector gesture={panGesture}>
              <View style={styles.scoreContainer}>
                <Text style={{fontSize: 20}}>Как твои делишки?</Text>
                <ReAnimated.View style={[styles.contentPlaceholder, animatedContentProps]}>
                    <ReAnimated.View style={[styles.moodMeter, contentAnimatedStyle]}>
                      {emojis.map((emoji, index) => (
                        <TouchableOpacity key={index} onPress={() => console.log(index + 1)}>
                          <Text style={{ fontSize: 40 }}>{emoji}</Text>
                        </TouchableOpacity>
                      ))}
                    </ReAnimated.View>
                  </ReAnimated.View>
                <ReAnimated.View style={[styles.invisibleShade, tailStyle]}/>
                <ReAnimated.View style={[styles.scoreShade, animatedStyle, { cursor: 'grab' }]}>
                  <View>
                    <Text style={styles.pullIcon}>︾</Text>
                  </View>
                </ReAnimated.View>
              </View>
            </GestureDetector>
            <TouchableOpacity
              onPress={() => setCurrentTab('recycle')}
            >
              <Text style={styles.icon}>🗑️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrentTab('settings')}
            >
              <Text style={styles.icon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.main}>
            {currentTab === 'todo' && (
              <TodoTab 
                task={task}
                setTask={setTask} 
                addTask={addTask} 
                todoList={todoList} 
                statusChangeTask={statusChangeTask} 
                deleteTodo={deleteToRecycle}
                leftAction={leftAction}
              />
            )}
            {currentTab === 'recycle' && (
              <RecycleTab 
                todoList={todoList} 
                deleteTodo={deleteTodo}
                leftAction={leftAction}
              />
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.tab, currentTab === 'rpg' && styles.activeTab]} 
              onPress={() => setCurrentTab('rpg')}
            >
              <Text style={styles.tabText}>РПГ</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, currentTab === 'todo' && styles.activeTab]} 
              onPress={() => setCurrentTab('todo')}
            >
              <Text style={styles.tabText}>To do</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, currentTab === 'daily' && styles.activeTab]} 
              onPress={() => setCurrentTab('daily')}
            >
              <Text style={styles.tabText}>ЕЖЕДНЕВКИ</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const TodoItem = memo(({ item, statusChangeTask, deleteTodo, leftAction }) => {

  const handlePress = useCallback(() => {
    statusChangeTask(item.id, item.completed);
  }, [item.id, item.completed, statusChangeTask]);

  const handleDelete = useCallback(() => {
    deleteTodo(item.id);
  }, [item.id, deleteTodo]);

  const renderLeft = useCallback((prog, drag) => {
    return leftAction(prog, drag, 'toRecycle');
  }, [leftAction]);
  
  return (
    <Swipeable
      friction={1.6}
      leftThreshold={78}
      overshootLeft={true}
      renderLeftActions={renderLeft}
      onSwipeableLeftOpen={handleDelete}
      containerStyle={{
        paddingTop: 8,
        paddingBottom: 2,
        paddingHorizontal: 20,
        backgroundColor: 'transparent', 
      }}
    >
      <View style={styles.todoItem}>
        <TouchableOpacity 
          delayPressIn={150}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 100 }}
          onPress={handlePress}
          style={[styles.checkbox, item.completed && styles.checked]}
        >
          {item.completed && <Text style={styles.checkMark}>✓</Text>}
        </TouchableOpacity>
        <Text  
          style={[styles.todoText, item.completed && styles.completedText]}
          onPress={handlePress}
        >
          {item.text}
        </Text>
      </View>
    </Swipeable>
  );
});

const TodoTab = memo(({
   todoList, 
   task, 
   setTask, 
   addTask, 
   deleteTodo, 
   statusChangeTask, 
   leftAction,
}) => {
  
  const activeTodos = useMemo(() => 
    todoList.filter(item => !item.deleted), 
    [todoList]
  );

  const renderItem = React.useCallback(({ item }) => (
    <TodoItem 
      item={item}
      statusChangeTask={statusChangeTask}
      deleteTodo={deleteTodo}
      leftAction={leftAction}
    />
  ), [statusChangeTask, deleteTodo, leftAction]);

  return (
    <View style={styles.todoWrapper}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={task}
          onChangeText={setTask}
          placeholder="Что нужно сделать?"
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        removeClippedSubviews={true}
        data={activeTodos}
        overScrollMode="never"
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 10 }}
      />
    </View>
  );
});

const leftAction = (prog, drag, mode) => {
  const isRecycle = mode === 'hardDelete';

  const opacity = drag.interpolate({
    inputRange: [0, 30, 77 - (isRecycle ? 2 : -6)],
    outputRange: [0, 0.4, 1],
    extrapolate: 'clamp',
  });

  const translateX = drag.interpolate({
    inputRange: [0, 65, 77 - (isRecycle ? 2 : -6)],
    outputRange: [-59 + (isRecycle ? 2 : -6), 6 + (isRecycle ? 2 : -6), 18],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ 
      height: '100%', 
      justifyContent: 'center', 
      paddingTop: 8,
      paddingBottom: 2,
    }}>
      <Animated.View style={[
        styles.deleteBack, 
        {
          opacity: opacity,
          marginRight: -190,
          transform: [{ translateX: translateX}],
          backgroundColor: isRecycle ? '#EF4444' : '#3B82F6'
        }
      ]}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {isRecycle ? 'Удалить':'В корзину'}
        </Text>
      </Animated.View> 
    </View>
  );
};

const RecycleItem = memo(({ item, deleteTodo, leftAction }) => {

  const handleDelete = useCallback(() => {
    deleteTodo(item.id);
  }, [item.id, deleteTodo]);

  const renderLeft = useCallback((prog, drag) => {
    return leftAction(prog, drag, 'hardDelete')
  }, [leftAction]);

  return (
    <Swipeable
      friction={1.6}
      leftThreshold={70}
      overshootLeft={true}
      renderLeftActions={renderLeft}
      onSwipeableLeftOpen={handleDelete}
      containerStyle={{
        paddingTop: 8,
        paddingBottom: 2,
        paddingHorizontal: 20,
        backgroundColor: 'transparent', 
      }}
    >
      <View style={styles.todoItem}>
        <Text style={[styles.todoText, item.completed && styles.completedText]}>
          {item.text}
        </Text>
      </View>
    </Swipeable>
  );
});

const RecycleTab = memo(({ todoList, deleteTodo, leftAction }) => {

  const activeTodos = useMemo(() => 
    todoList.filter(item => item.deleted), 
    [todoList]
  );

  const renderItem = React.useCallback(({ item }) => (
    <RecycleItem 
      item={item}
      deleteTodo={deleteTodo}
      leftAction={leftAction}
    />
  ), [deleteTodo, leftAction]); // Важно добавить зависимости

  return (
    <FlatList
      removeClippedSubviews={true}
      data={activeTodos}
      overScrollMode="never"
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 10 }}
    />
  );
});