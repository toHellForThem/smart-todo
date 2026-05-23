import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, Keyboard, LayoutAnimation } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { styles } from '../../styles';
import { socket } from '../utils/socket';
import { FillProgress } from '../components/FillProgress';

const timeToReset = [18, 45, 0, 0];

const DailyItem = memo(({ item, statusChangeTask, deleteTodo, leftAction }) => {
  const handlePress = useCallback(() => {
    statusChangeTask(item.id);
  }, [item.id, statusChangeTask]);

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
        <FillProgress
          progressNow={item.progressNow}
          progressEnd={item.progressEnd}
        />
        <Text
          style={[
            styles.todoText,
            { backgroundColor: 'transparent' },
            item.completed && styles.completedTextDaily
          ]}
          onPress={handlePress}
        >
          {item.text}
        </Text>
        <TouchableOpacity
          onPress={handlePress}
          style={{
            marginLeft: 'auto',
            alignSelf: 'stretch',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#d9e7fd',
            borderBottomRightRadius: 15,
            borderTopRightRadius: 15,
            width: 50,
            borderLeftColor: '#000000',
          }}
        >
          <Ionicons
            style={{
              alignItems: 'center'
            }}
            name={item.completed ? 'flash-sharp' : 'flash-outline'}
            size={25}
            color={'#3B82F6'}
          />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
});

export const DailyTab = memo(({ todoList, setTodoList, onAdd, statusChangeTask, deleteTodo, leftAction }) => {
  const [task, setTask] = useState('');
  const [progressEnd, setProgressEnd] = useState(1);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const dailies = useMemo(() =>
    todoList.filter(item => item.type === 'daily' && !item.deleted),
    [todoList]
  );

  useEffect(() => {
    let timerId;

    const scheduleNextReset = () => {
      const now = new Date();
      const tomorrow = new Date(now);

      tomorrow.setHours(...timeToReset);

      if (tomorrow <= now) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      let toUpdatedAt = Date.now();

      timerId = setTimeout(() => {
        toUpdatedAt = Date.now();
        setTodoList(prev => prev.map(item =>
          item.type === 'daily'
            ? { ...item, progressNow: 0, completed: false, updatedAt: toUpdatedAt }
            : item
        ));
        socket.emit('client:confirm_reset', 'daily', toUpdatedAt);

        scheduleNextReset();
      }, msUntilMidnight);
    };

    scheduleNextReset();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [setTodoList]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const progress = useMemo(() => {
    if (dailies.length === 0) return 0;
    const { needProgress, nowProgress } = dailies.reduce((acc, item) => {
      acc.needProgress += (item.progressEnd || 0);
      acc.nowProgress += (item.progressNow || 0);
      return acc;
    }, { needProgress: 0, nowProgress: 0 });

    return Math.round((nowProgress / needProgress) * 100);
  }, [dailies]);

  const handleAdd = useCallback(() => {
    if (task.trim()) {
      onAdd(task, progressEnd);
      setTask('');
    }
  }, [task, progressEnd, onAdd]);

  const renderItem = useCallback(({ item }) => (
    <DailyItem
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
          placeholder=" Что планируешь?"
          placeholderTextColor="#94A3B8"
          cursorColor='#3B82F6'
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <MaterialCommunityIcons name="plus-thick" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={dailies}
        overScrollMode="never"
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 10 }}
      />
      <View style={[styles.floatingContainer, {
        bottom: keyboardHeight - 71,
        opacity: isKeyboardVisible ? 1 : 0
      }]}>
        <TouchableOpacity hitSlop={20} onPress={() => {
          setProgressEnd(progressEnd === 1 ? 1 : progressEnd - 1);
        }}>
          <Ionicons name="remove-circle-outline" size={30} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginHorizontal: 5 }}>
          {progressEnd}
        </Text>
        <TouchableOpacity hitSlop={20} onPress={() => {
          setProgressEnd(progressEnd === 20 ? 20 : progressEnd + 1);
        }}>
          <Ionicons name="add-circle-outline" size={30} color="#3B82F6" />
        </TouchableOpacity>
      </View>
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, progress === 100 && styles.progressTextCompleted]}>Прогресс дня: {progress}%</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
});

