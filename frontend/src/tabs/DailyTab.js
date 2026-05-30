import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, Keyboard, LayoutAnimation } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { getStyles } from './DailyTab.styles';
import { getStyles as getItemStyles } from '../styles/item.styles';
import { useAppTheme, useStyles } from '../theme/ThemeContext';
import { FillProgress } from '../components/FillProgress';


const DailyItem = memo(({ item, statusChangeTask, deleteTodo, leftAction }) => {
  const styles = useStyles(getStyles);
  const itemStyles = useStyles(getItemStyles);
  const { theme } = useAppTheme();

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

export const DailyTab = memo(({ todoList, setTodoList, onAdd, statusChangeTask, deleteTodo, leftAction }) => {
  const styles = useStyles(getStyles);
  const { theme } = useAppTheme();
  const [task, setTask] = useState('');
  const [progressEnd, setProgressEnd] = useState(1);
  const [selectedDays, setSelectedDays] = useState('1111111');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const dailies = useMemo(() =>
    todoList.filter(item => {
      if (item.type !== 'daily' || item.deleted) return false;
      const todayDayIdx = (new Date().getDay() + 6) % 7;
      const daysStr = item.days || '1111111';
      return daysStr[todayDayIdx] === '1';
    }),
    [todoList]
  );

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
      onAdd(task, progressEnd, 'daily', 0, 0, selectedDays);
      setTask('');
      setSelectedDays('1111111');
    }
  }, [task, progressEnd, selectedDays, onAdd]);

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
        opacity: isKeyboardVisible ? 1 : 0,
        flexDirection: 'column',
        height: 100,
        paddingVertical: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
      }]}>
        {/* Row 1: Weekdays Selector */}
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', width: '100%' }}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, idx) => {
            const isSelected = selectedDays[idx] === '1';
            return (
              <TouchableOpacity
                key={day}
                onPress={() => {
                  setSelectedDays(prev => {
                    const arr = prev.split('');
                    arr[idx] = arr[idx] === '1' ? '0' : '1';
                    if (arr.every(x => x === '0')) return prev;
                    return arr.join('');
                  });
                }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? theme.colors.background : 'transparent',
                  borderWidth: 1.5,
                  borderColor: isSelected ? theme.colors.primary : 'transparent',
                }}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: 'bold',
                  color: isSelected ? theme.colors.primary : theme.colors.text.secondary
                }}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Row 2: Progress End Selector */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <TouchableOpacity hitSlop={15} onPress={() => {
            setProgressEnd(progressEnd === 1 ? 1 : progressEnd - 1);
          }}>
            <Ionicons name="remove-circle-outline" size={24} color={theme.colors.icon.primary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginHorizontal: 15, color: theme.colors.text.primary }}>
            {progressEnd}
          </Text>
          <TouchableOpacity hitSlop={15} onPress={() => {
            setProgressEnd(progressEnd === 20 ? 20 : progressEnd + 1);
          }}>
            <Ionicons name="add-circle-outline" size={24} color={theme.colors.icon.primary} />
          </TouchableOpacity>
        </View>
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

