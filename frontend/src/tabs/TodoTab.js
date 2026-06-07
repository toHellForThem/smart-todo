import { memo, useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, Keyboard, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { getStyles } from './TodoTab.styles';
import { getStyles as getItemStyles } from '../styles/item.styles';
import { useAppTheme, useStyles } from '../theme/ThemeContext';
import { useTranslation } from '../utils/LanguageContext';

const TodoItem = memo(({ item, statusChangeTask, deleteTodo, leftAction, isSelected }) => {
  const itemStyles = useStyles(getItemStyles);
  const { theme } = useAppTheme();

  const startX = useRef(0);
  const startY = useRef(0);

  const handlePressIn = useCallback((e) => {
    if (Platform.OS === 'web') {
      startX.current = e.nativeEvent.pageX || e.nativeEvent.clientX || 0;
      startY.current = e.nativeEvent.pageY || e.nativeEvent.clientY || 0;
    }
  }, []);

  const handlePress = useCallback((e) => {
    if (Platform.OS === 'web' && e) {
      const endX = e.nativeEvent.pageX || e.nativeEvent.clientX || 0;
      const endY = e.nativeEvent.pageY || e.nativeEvent.clientY || 0;
      const dist = Math.sqrt(Math.pow(endX - startX.current, 2) + Math.pow(endY - startY.current, 2));
      if (dist > 8) return;
    }
    statusChangeTask(item.id, 1);
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
      activeOffsetX={[-15, 15]}
      failOffsetY={[-15, 15]}
    >
      <View style={[
        itemStyles.todoItem,
        isSelected && { backgroundColor: theme.colors.icon.bg }
      ]}>
        {isSelected && (
          <View style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: theme.colors.primary,
            zIndex: 10,
          }} />
        )}
        <TouchableOpacity
          delayPressIn={150}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 100 }}
          onPressIn={handlePressIn}
          onPress={handlePress}
          style={[itemStyles.checkbox, item.completed && itemStyles.checked]}
        >
          {item.completed && (
            <MaterialCommunityIcons
              style={{ borderRadius: theme.radius.xs, backgroundColor: theme.colors.icon.bg }}
              name={'check-bold'}
              size={20}
              color={theme.colors.icon.primary}
            />
          )}
        </TouchableOpacity>
        <Text
          style={[itemStyles.todoText, item.completed && itemStyles.completedText]}
          onPressIn={handlePressIn}
          onPress={handlePress}
        >
          {item.text}
        </Text>
      </View>
    </Swipeable>
  );
});

const TodoInput = memo(({ onAdd, inputRef }) => {
  const styles = useStyles(getStyles);
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const [task, setTask] = useState('');

  const handleKeyPress = useCallback((e) => {
    if (e.nativeEvent?.key === 'Escape') {
      e.stopPropagation();
      Keyboard.dismiss();
    }
  }, []);

  const handleAdd = useCallback(() => {
    if (task.trim()) {
      onAdd(task, 1);
      setTask('');
    }
  }, [task, onAdd]);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={task}
        onChangeText={setTask}
        placeholder={t('todo_placeholder')}
        placeholderTextColor={theme.colors.text.muted}
        cursorColor={theme.colors.primary}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
        onKeyPress={handleKeyPress}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <MaterialCommunityIcons
          style={{ borderRadius: 10, backgroundColor: theme.colors.icon.bg }}
          name={'plus-thick'}
          size={24}
          color={theme.colors.icon.primary}
        />
      </TouchableOpacity>
    </View>
  );
});

export const TodoTab = memo(({
  todoList,
  onAdd,
  deleteTodo,
  statusChangeTask,
  leftAction,
  selectedTaskId,
  focusInputTrigger,
  isActive,
}) => {
  const styles = useStyles(getStyles);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const lastTrigger = useRef(focusInputTrigger);

  useEffect(() => {
    if (focusInputTrigger !== lastTrigger.current) {
      lastTrigger.current = focusInputTrigger;
      if (isActive) {
        inputRef.current?.focus();
      }
    }
  }, [focusInputTrigger, isActive]);

  const activeTodos = useMemo(() =>
    todoList
      .filter(item => item.type === 'todo' && !item.deleted)
      .sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        return 0;
      }),
    [todoList]
  );

  useEffect(() => {
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      const activeInput = TextInput.State.currentlyFocusedInput();
      if (activeInput) {
        TextInput.State.blurTextInput(activeInput);
      }
    });
    return () => hideSubscription.remove();
  }, []);

  useEffect(() => {
    if (!selectedTaskId || !flatListRef.current) return;
    const index = activeTodos.findIndex(item => item.id === selectedTaskId);
    if (index !== -1) {
      try {
        flatListRef.current.scrollToIndex({
          index,
          viewPosition: 0.5,
          animated: true,
        });
      } catch (err) {
        try {
          flatListRef.current.scrollToOffset({
            offset: index * 60,
            animated: true,
          });
        } catch (innerErr) {
          console.log('Scroll to selected todo failed:', innerErr);
        }
      }
    }
  }, [selectedTaskId, activeTodos]);

  const renderItem = useCallback(({ item }) => (
    <TodoItem
      item={item}
      statusChangeTask={statusChangeTask}
      deleteTodo={deleteTodo}
      leftAction={leftAction}
      isSelected={item.id === selectedTaskId}
    />
  ), [statusChangeTask, deleteTodo, leftAction, selectedTaskId]);

  return (
    <View style={styles.todoWrapper}>
      <TodoInput onAdd={onAdd} inputRef={inputRef} />
      <FlatList
        ref={flatListRef}
        data={activeTodos}
        extraData={selectedTaskId}
        bounces={false}
        overScrollMode="never"
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 6, paddingBottom: 10 }}
      />
    </View>
  );
});

