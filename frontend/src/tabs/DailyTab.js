import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, Keyboard, LayoutAnimation } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { styles } from './DailyTab.styles';
import { styles as itemStyles } from '../styles/item.styles';
import { theme } from '../theme/theme';
import { socket } from '../utils/socket';
import { FillProgress } from '../components/FillProgress';


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
        paddingTop: 2,
        paddingBottom: 8,
        paddingHorizontal: 20,
        backgroundColor: 'transparent',
      }}
    >
      <View style={itemStyles.todoItem}>
        <FillProgress
          progressNow={item.progressNow}
          progressEnd={item.progressEnd}
        />
        <Text
          style={[
            itemStyles.todoText,
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
            backgroundColor: theme.colors.icon.bg,
            borderBottomRightRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            width: 50,
          }}
        >
          <Ionicons
            style={{
              alignItems: 'center'
            }}
            name={item.completed ? 'flash-sharp' : 'flash-outline'}
            size={25}
            color={theme.colors.icon.primary}
          />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
});

export const DailyTab = memo(({ todoList, setTodoList, onAdd, statusChangeTask, deleteTodo, leftAction, resetTimeStr = '18:45', resetEnabled = true }) => {
  const [task, setTask] = useState('');
  const [progressEnd, setProgressEnd] = useState(1);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const dailies = useMemo(() =>
    todoList.filter(item => item.type === 'daily' && !item.deleted),
    [todoList]
  );

  const timeToReset = useMemo(() => {
    const parts = (resetTimeStr || '18:45').split(':').map(Number);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1], 0, 0];
    }
    return [18, 45, 0, 0];
  }, [resetTimeStr]);

  useEffect(() => {
    let timerId;

    const scheduleNextReset = () => {
      if (!resetEnabled) return;
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
  }, [setTodoList, timeToReset, resetEnabled]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);

      // Force blur any active TextInput to stop the cursor from blinking
      const activeInput = TextInput.State.currentlyFocusedInput();
      if (activeInput) {
        TextInput.State.blurTextInput(activeInput);
      }

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
          placeholderTextColor={theme.colors.text.muted}
          cursorColor={theme.colors.primary}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <MaterialCommunityIcons name="plus-thick" size={24} color={theme.colors.icon.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={dailies}
        bounces={false}
        overScrollMode="never"
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 6, paddingBottom: 10 }}
      />
      <View style={[styles.floatingContainer, {
        bottom: keyboardHeight - 71,
        opacity: isKeyboardVisible ? 1 : 0
      }]}>
        <TouchableOpacity hitSlop={20} onPress={() => {
          setProgressEnd(progressEnd === 1 ? 1 : progressEnd - 1);
        }}>
          <Ionicons name="remove-circle-outline" size={30} color={theme.colors.icon.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginHorizontal: 5 }}>
          {progressEnd}
        </Text>
        <TouchableOpacity hitSlop={20} onPress={() => {
          setProgressEnd(progressEnd === 20 ? 20 : progressEnd + 1);
        }}>
          <Ionicons name="add-circle-outline" size={30} color={theme.colors.icon.primary} />
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

