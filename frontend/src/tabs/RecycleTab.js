import { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { styles } from '../../styles';
import { socket } from '../utils/socket';

const RecycleItem = memo(({ item, deleteTodo, leftAction, setTodoList }) => {
  const handleDelete = useCallback(() => {
    deleteTodo(item.id);
  }, [item.id, deleteTodo]);

  const renderLeft = useCallback((prog, drag) => {
    return leftAction(prog, drag, 'hardDelete')
  }, [leftAction]);

  const restoreTask = useCallback(() => {
    let updated = null;
    setTodoList(prev => {
      return prev.map(todo => {
        if (todo.id === item.id) {
          updated = { ...todo, deleted: !todo.deleted, updatedAt: Date.now() };
          return updated;
        }
        return todo;
      });
    });
    if (updated) {
      socket.emit('client:sync_todo', updated);
    }
  }, [socket, item.id, setTodoList]);

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
        <TouchableOpacity
          onPress={restoreTask}
          style={{
            marginLeft: 'auto',
            alignSelf: 'stretch',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#d9e7fd',
            borderBottomRightRadius: 15,
            borderTopRightRadius: 15,
            width: 50,
          }}
        >
          <Ionicons
            style={{
              alignItems: 'center'
            }}
            name={'arrow-undo-outline'}
            size={25}
            color={'#3B82F6'}
          />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
});

export const RecycleTab = memo(({ todoList, deleteTodo, leftAction, setTodoList, context }) => {

  const activeTodos = useMemo(() =>
    todoList.filter(item => item.deleted && item.type === context),
    [todoList, context]
  );

  const renderItem = useCallback(({ item }) => (
    <RecycleItem
      setTodoList={setTodoList}
      item={item}
      deleteTodo={deleteTodo}
      leftAction={leftAction}
    />
  ), [deleteTodo, leftAction]);

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

