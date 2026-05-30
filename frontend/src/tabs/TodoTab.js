import { memo, useCallback, useMemo, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { getStyles } from './TodoTab.styles';
import { getStyles as getItemStyles } from '../styles/item.styles';
import { useAppTheme, useStyles } from '../theme/ThemeContext';

const TodoItem = memo(({ item, statusChangeTask, deleteTodo, leftAction }) => {
  const styles = useStyles(getStyles);
  const itemStyles = useStyles(getItemStyles);
  const { theme } = useAppTheme();

  const handlePress = useCallback(() => {
    statusChangeTask(item.id, 1);
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
        paddingTop: 2,
        paddingBottom: 8,
        paddingHorizontal: 20,
        backgroundColor: 'transparent',
      }}
    >
      <View style={itemStyles.todoItem}>
        <TouchableOpacity
          delayPressIn={150}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 100 }}
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
          onPress={handlePress}
        >
          {item.text}
        </Text>
      </View>
    </Swipeable>
  );
});

export const TodoTab = memo(({
  todoList,
  task,
  setTask,
  onAdd,
  deleteTodo,
  statusChangeTask,
  leftAction
}) => {
  const styles = useStyles(getStyles);
  const { theme } = useAppTheme();

  const activeTodos = useMemo(() =>
    todoList.filter(item => item.type === 'todo' && !item.deleted),
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

  const handleAdd = useCallback(() => {
    if (task.trim()) {
      onAdd(task, 1);
      setTask('');
    }
  }, [task, onAdd, setTask]);

  const renderItem = useCallback(({ item }) => (
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
          placeholder=" Что планируешь?"
          placeholderTextColor={theme.colors.text.muted}
          cursorColor={theme.colors.primary}
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
      <FlatList
        data={activeTodos}
        bounces={false}
        overScrollMode="never"
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 6, paddingBottom: 10 }}
      />
    </View>
  );
});

