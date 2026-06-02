import { memo } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

export const HabitsSubtab = memo(({
  allHabits,
  habitName,
  setHabitName,
  pointsOrDeposit,
  setPointsOrDeposit,
  handleAddHabit,
  statusChangeTask,
  deleteToRecycle,
  renderSwipeLeft,
  styles,
  theme,
  t,
}) => {
  return (
    <View style={styles.container}>
      <View style={{ marginTop: 10 }} />

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
          style={styles.input}
          placeholder={t('rpg_habit_placeholder')}
          placeholderTextColor="#94A3B8"
          cursorColor={theme.colors.icon.primary}
          selectionColor={theme.colors.icon.primary}
          value={habitName}
          onChangeText={setHabitName}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddHabit}>
          <MaterialCommunityIcons
            style={{ borderRadius: 10, backgroundColor: theme.colors.icon.bg }}
            name={'plus-thick'}
            size={24}
            color={theme.colors.icon.primary}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={allHabits}
        bounces={false}
        overScrollMode="never"
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.habitList}
        renderItem={({ item }) => (
          <Swipeable
            friction={1.6}
            leftThreshold={78}
            overshootLeft={true}
            renderLeftActions={renderSwipeLeft}
            onSwipeableLeftOpen={() => deleteToRecycle(item.id)}
            containerStyle={{
              paddingTop: 2,
              paddingBottom: 8,
              paddingHorizontal: 20,
              backgroundColor: 'transparent',
            }}
            activeOffsetX={[-15, 15]}
            failOffsetY={[-15, 15]}
          >
            <View style={styles.habitItem}>
              <TouchableOpacity
                onPress={() => statusChangeTask(item.id, 'reset')}
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
                onPress={() => statusChangeTask(item.id)}
              >
                <MaterialCommunityIcons name="check-bold" size={25} color={theme.colors.icon.primary} />
              </TouchableOpacity>
            </View>
          </Swipeable>
        )}
      />
    </View>
  );
});
