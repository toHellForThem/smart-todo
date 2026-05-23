import { memo, useCallback, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { styles } from '../../styles';

const TodoItem = memo(({ item, statusChangeTask, deleteTodo, leftAction }) => {
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
          {item.completed && (
            <MaterialCommunityIcons
              style={{ borderRadius: 4, backgroundColor: '#d9e7fd' }}
              name={'check-bold'}
              size={20}
              color={'#3B82F6'}
            />
          )}
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

export const TodoTab = memo(({
  todoList,
  task,
  setTask,
  onAdd,
  deleteTodo,
  statusChangeTask,
  leftAction,
}) => {

  const activeTodos = useMemo(() =>
    todoList.filter(item => item.type === 'todo' && !item.deleted),
    [todoList]
  );

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
          placeholderTextColor="#94A3B8"
          cursorColor='#3B82F6'
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <MaterialCommunityIcons
            style={{ borderRadius: 10, backgroundColor: '#d9e7fd' }}
            name={'plus-thick'}
            size={24}
            color={'#3B82F6'}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={activeTodos}
        overScrollMode="never"
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 10 }}
      />
    </View>
  );
});

