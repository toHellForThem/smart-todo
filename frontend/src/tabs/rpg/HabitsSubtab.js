import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const HabitItem = memo(({
  item,
  statusChangeTask,
  deleteToRecycle,
  renderSwipeLeft,
  styles,
  theme,
  isSelected,
}) => {
  const handleReset = useCallback(() => {
    statusChangeTask(item.id, 'reset');
  }, [item.id, statusChangeTask]);

  const handleComplete = useCallback(() => {
    statusChangeTask(item.id);
  }, [item.id, statusChangeTask]);

  const handleSwipeOpen = useCallback(() => {
    deleteToRecycle(item.id);
  }, [item.id, deleteToRecycle]);

  const renderSwipe = useCallback((prog, drag) => {
    return renderSwipeLeft(prog, drag);
  }, [renderSwipeLeft]);

  return (
    <Swipeable
      friction={1.6}
      leftThreshold={78}
      overshootLeft={true}
      renderLeftActions={renderSwipe}
      onSwipeableLeftOpen={handleSwipeOpen}
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
        styles.habitItem,
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
          onPress={handleReset}
          style={{
            alignSelf: 'stretch',
            width: 50,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: item.contribution === 1
              ? 'rgba(52, 211, 153, 0.15)'
              : item.contribution === -1
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(148, 163, 184, 0.15)',
            borderBottomLeftRadius: theme.radius.xl,
            borderTopLeftRadius: theme.radius.xl,
          }}
        >
          <MaterialCommunityIcons
            name={item.contribution === 1 ? 'plus' : item.contribution === -1 ? 'minus' : 'help'}
            size={25}
            color={item.contribution === 1 ? '#34D399' : item.contribution === -1 ? '#EF4444' : '#94A3B8'}
          />
        </TouchableOpacity>
        <Text style={styles.habitText}>{item.text}</Text>
        <Text style={styles.habitCount}>{item.progressNow || 0}</Text>
        <TouchableOpacity
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
          onPress={handleComplete}
        >
          <MaterialCommunityIcons name="check-bold" size={25} color={theme.colors.icon.primary} />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
});

const HabitInput = memo(({
  handleAddHabit,
  styles,
  theme,
  t,
  inputRef,
}) => {
  const [habitName, setHabitName] = useState('');
  const [pointsOrDeposit, setPointsOrDeposit] = useState('positive');

  const handleKeyPress = useCallback((e) => {
    const key = e.nativeEvent?.key || e.key;
    const isCtrl = e.ctrlKey || e.metaKey;

    if (key === 'Escape') {
      e.stopPropagation();
      Keyboard.dismiss();
      return;
    }

    if (isCtrl) {
      if (key === '0') {
        e.preventDefault();
        e.stopPropagation();
        setPointsOrDeposit('neutral');
      } else if (key === '-') {
        e.preventDefault();
        e.stopPropagation();
        setPointsOrDeposit('negative');
      } else if (key === '=') {
        e.preventDefault();
        e.stopPropagation();
        setPointsOrDeposit('positive');
      }
    }
  }, [setPointsOrDeposit]);

  const handleAdd = useCallback(() => {
    if (!habitName.trim()) return;
    handleAddHabit(habitName, pointsOrDeposit);
    setHabitName('');
  }, [habitName, pointsOrDeposit, handleAddHabit]);

  return (
    <View style={styles.inputBlock}>
      <TouchableOpacity
        style={[
          styles.typeToggleButtonCompact,
          {
            borderColor: pointsOrDeposit === 'positive'
              ? '#34D399'
              : pointsOrDeposit === 'neutral'
                ? '#94A3B8'
                : '#EF4444',
            backgroundColor: pointsOrDeposit === 'positive'
              ? 'rgba(52, 211, 153, 0.15)'
              : pointsOrDeposit === 'neutral'
                ? 'rgba(148, 163, 184, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
          }
        ]}
        onPress={() => setPointsOrDeposit(prev => {
          if (prev === 'positive') return 'neutral';
          if (prev === 'neutral') return 'negative';
          return 'positive';
        })}
      >
        <MaterialCommunityIcons
          name={pointsOrDeposit === 'positive' ? 'plus' : pointsOrDeposit === 'neutral' ? 'help' : 'minus'}
          size={20}
          color={pointsOrDeposit === 'positive' ? '#34D399' : pointsOrDeposit === 'neutral' ? '#94A3B8' : '#EF4444'}
        />
      </TouchableOpacity>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={t('rpg_habit_placeholder')}
        placeholderTextColor="#94A3B8"
        cursorColor={theme.colors.icon.primary}
        selectionColor={theme.colors.icon.primary}
        value={habitName}
        onChangeText={setHabitName}
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

export const HabitsSubtab = memo(({
  allHabits,
  handleAddHabit,
  statusChangeTask,
  deleteToRecycle,
  renderSwipeLeft,
  styles,
  theme,
  t,
  selectedTaskId,
  focusInputTrigger,
  isActive,
}) => {
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

  useEffect(() => {
    if (!selectedTaskId || !flatListRef.current) return;
    const index = allHabits.findIndex(item => item.id === selectedTaskId);
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
          console.log('Scroll to selected habit failed:', innerErr);
        }
      }
    }
  }, [selectedTaskId, allHabits]);
  const renderItem = useCallback(({ item }) => (
    <HabitItem
      item={item}
      statusChangeTask={statusChangeTask}
      deleteToRecycle={deleteToRecycle}
      renderSwipeLeft={renderSwipeLeft}
      styles={styles}
      theme={theme}
      isSelected={item.id === selectedTaskId}
    />
  ), [statusChangeTask, deleteToRecycle, renderSwipeLeft, styles, theme, selectedTaskId]);

  return (
    <View style={styles.container}>
      <View style={{ marginTop: 10 }} />
      <HabitInput
        handleAddHabit={handleAddHabit}
        styles={styles}
        theme={theme}
        t={t}
        inputRef={inputRef}
      />
      <FlatList
        ref={flatListRef}
        data={allHabits}
        extraData={selectedTaskId}
        bounces={false}
        overScrollMode="never"
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.habitList}
        renderItem={renderItem}
      />
    </View>
  );
});
