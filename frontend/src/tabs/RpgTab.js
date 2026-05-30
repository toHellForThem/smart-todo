import { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  LayoutAnimation,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { getStyles } from './RpgTab.styles';
import { useAppTheme, useStyles } from '../theme/ThemeContext';
import { getLogicalDateStr } from '../utils/date';

const moodConfig = {
  1: { icon: 'emoticon-dead-outline', color: '#64748B', glassBg: '#EDF2F7', dashboardBg: '#CBD9EF', label: 'Ужасно' },
  2: { icon: 'emoticon-sad-outline', color: '#F43F5E', glassBg: '#FFE4E6', dashboardBg: '#DCD2E9', label: 'Плохо' },
  3: { icon: 'emoticon-neutral-outline', color: '#D98A2F', glassBg: '#FEF3C7', dashboardBg: '#D9DCE4', label: 'Нормально' },
  4: { icon: 'emoticon-happy-outline', color: '#10B981', glassBg: '#D1FAE5', dashboardBg: '#C1E1EE', label: 'Хорошо' },
  5: { icon: 'emoticon-excited-outline', color: '#8B5CF6', glassBg: '#EDE9FE', dashboardBg: '#CFD6FC', label: 'Отлично' },
};

const monthsRU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const monthsGenitiveRU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

export const RpgTab = ({
  rpgHistory,
  setRpgHistory,
  todoList,
  leftAction,
  deleteToRecycle,
  addTask,
  statusChangeTask,
  subtab,
  setSubtab,
  isCalendarVisible,
  setCalendarVisible,
  settings,
}) => {
  const styles = useStyles(getStyles);
  const { theme } = useAppTheme();
  const isDark = settings?.theme === 'dark';
  const activeMoodConfig = useMemo(() => {
    return {
      1: { icon: 'emoticon-dead-outline', color: isDark ? '#94A3B8' : '#64748B', glassBg: isDark ? '#334155' : '#EDF2F7', dashboardBg: isDark ? '#1E293B' : '#CBD9EF', label: 'Ужасно' },
      2: { icon: 'emoticon-sad-outline', color: isDark ? '#FB7185' : '#F43F5E', glassBg: isDark ? '#4c0519' : '#FFE4E6', dashboardBg: isDark ? '#881337' : '#DCD2E9', label: 'Плохо' },
      3: { icon: 'emoticon-neutral-outline', color: isDark ? '#F59E0B' : '#D98A2F', glassBg: isDark ? '#451a03' : '#FEF3C7', dashboardBg: isDark ? '#78350f' : '#D9DCE4', label: 'Нормально' },
      4: { icon: 'emoticon-happy-outline', color: isDark ? '#34D399' : '#10B981', glassBg: isDark ? '#064e3b' : '#D1FAE5', dashboardBg: isDark ? '#065f46' : '#C1E1EE', label: 'Хорошо' },
      5: { icon: 'emoticon-excited-outline', color: isDark ? '#C084FC' : '#8B5CF6', glassBg: isDark ? '#2e1065' : '#EDE9FE', dashboardBg: isDark ? '#4c1d95' : '#CFD6FC', label: 'Отлично' },
    };
  }, [isDark]);

  const [selectedDayDetail, setSelectedDayDetail] = useState(null);
  const [isHabitsExpanded, setIsHabitsExpanded] = useState(false);

  // Keyboard avoidance and suggestion hooks
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Inputs for creation
  const [habitName, setHabitName] = useState('');
  const [pointsOrDeposit, setPointsOrDeposit] = useState('positive'); // 'positive' (Очки) | 'negative' (Вклад)

  const [piggyGoal, setPiggyGoal] = useState('');
  const [piggyTarget, setPiggyTarget] = useState('');
  const [piggyInputs, setPiggyInputs] = useState({}); // map of piggy id to input values
  const [focusedGoalId, setFocusedGoalId] = useState(null);
  const [flashingGoalId, setFlashingGoalId] = useState(null);
  const flashTimerRef = useRef(null);
  const flatListRef = useRef(null);
  const currentScrollY = useRef(0);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) {
        clearTimeout(flashTimerRef.current);
      }
    };
  }, []);

  const [showTitle, setShowTitle] = useState('');
  const [isMovieInput, setIsMovieInput] = useState(false);

  // Date constants
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => getLogicalDateStr(settings?.reset_time), [settings?.reset_time]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setKeyboardVisible(true);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    });
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
      setFocusedGoalId(null);

      // Force blur any active TextInput to stop the cursor from blinking
      const activeInput = TextInput.State.currentlyFocusedInput();
      if (activeInput) {
        TextInput.State.blurTextInput(activeInput);
      }

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Filter RPG elements dynamically from todoList
  const positiveHabits = useMemo(() =>
    todoList.filter(item => item.type === 'habit' && item.contribution === 1 && !item.deleted),
    [todoList]
  );

  const negativeHabits = useMemo(() =>
    todoList.filter(item => item.type === 'habit' && item.contribution === -1 && !item.deleted),
    [todoList]
  );

  const neutralHabits = useMemo(() =>
    todoList.filter(item => item.type === 'habit' && item.contribution === 0 && !item.deleted),
    [todoList]
  );

  const activeShows = useMemo(() =>
    todoList.filter(item => (item.type === 'tv_show' || item.type === 'movie') && !item.deleted),
    [todoList]
  );

  const piggyGoalItems = useMemo(() =>
    todoList.filter(item => item.type === 'piggy_bank' && !item.deleted),
    [todoList]
  );

  const focusedIndex = useMemo(() => {
    if (!focusedGoalId) return -1;
    return piggyGoalItems.findIndex(item => item.id === focusedGoalId);
  }, [focusedGoalId, piggyGoalItems]);

  // Handle auto-scroll of Piggy Bank goals when keyboard opens / closes
  useEffect(() => {
    if (isKeyboardVisible) {
      // Only scroll if the focused card is the 2nd item or lower (index >= 1)
      // because the first item is at the top and never gets covered.
      if (focusedIndex >= 1 && flatListRef.current) {
        const timer = setTimeout(() => {
          try {
            flatListRef.current.scrollToIndex({
              index: focusedIndex,
              viewPosition: 0.2, // Places it nicely in the top part of screen
              animated: true,
            });
          } catch (err) {
            // Fallback scroll if index not measured
            try {
              flatListRef.current.scrollToOffset({
                offset: focusedIndex * 70, // rough height of a compact piggy card + margin
                animated: true,
              });
            } catch (innerErr) {
              console.log('Scroll failed:', innerErr);
            }
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    } else {
      // Keyboard went away, restore original scroll offset only if there was a scroll (Y > 0)
      if (flatListRef.current && currentScrollY.current > 0) {
        const timer = setTimeout(() => {
          try {
            flatListRef.current.scrollToOffset({
              offset: currentScrollY.current,
              animated: true,
            });
          } catch (err) {
            console.log('Restore scroll failed:', err);
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [isKeyboardVisible, focusedIndex]);

  const handleScroll = (event) => {
    if (!isKeyboardVisible) {
      currentScrollY.current = event.nativeEvent.contentOffset.y;
    }
  };

  // Compute daily stats: dailies + habits
  const dailyStats = useMemo(() => {
    // 1. Dailies from todoList
    const dailies = todoList.filter(item => item.type === 'daily' && !item.deleted);
    let dailiesProgress = 0;
    if (dailies.length > 0) {
      const { needProgress, nowProgress } = dailies.reduce((acc, item) => {
        acc.needProgress += (item.progressEnd || 0);
        acc.nowProgress += (item.progressNow || 0);
        return acc;
      }, { needProgress: 0, nowProgress: 0 });
      dailiesProgress = Math.round((nowProgress / needProgress) * 100);
    }

    // 2. Habits total count today
    const positiveCount = positiveHabits.reduce((sum, h) => sum + (parseInt(h.progressNow, 10) || 0), 0);
    const negativeCount = negativeHabits.reduce((sum, h) => sum + (parseInt(h.progressNow, 10) || 0), 0);
    const neutralCount = neutralHabits.reduce((sum, h) => sum + (parseInt(h.progressNow, 10) || 0), 0);

    return {
      dailiesProgress,
      positiveCount,
      negativeCount,
      neutralCount,
    };
  }, [todoList, positiveHabits, negativeHabits, neutralHabits]);

  // Today's mood
  const todayMood = useMemo(() => {
    const todayLog = rpgHistory.find(h => h.date === todayStr);
    return todayLog ? todayLog.mood : null;
  }, [rpgHistory, todayStr]);

  const isTodaySelected = selectedDayDetail?.dateStr === todayStr;
  const displayProgress = isTodaySelected
    ? dailyStats.dailiesProgress
    : Math.round((selectedDayDetail?.log?.daily_progress || 0) * 100);
  const displayPosPoints = isTodaySelected
    ? dailyStats.positiveCount
    : (selectedDayDetail?.log?.pos_points || 0);
  const displayNegPoints = isTodaySelected
    ? dailyStats.negativeCount
    : (selectedDayDetail?.log?.neg_points || 0);

  // Helper to get Russian month name
  const currentMonthName = monthsRU[today.getMonth()];
  const currentMonthGenitive = monthsGenitiveRU[today.getMonth()];

  // Month Calendar cell definitions
  const calendarCells = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Monday starting offset
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const cells = [];
    // Pad empty cells
    for (let i = 0; i < offset; i++) {
      cells.push({ day: null, dateStr: null });
    }
    // Add real days
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ day, dateStr });
    }
    return cells;
  }, [today]);

  // Handle day tap on calendar
  const handleDayPress = (cell) => {
    if (!cell.dateStr) return;
    const log = rpgHistory.find(h => h.date === cell.dateStr);
    setSelectedDayDetail({
      dateStr: cell.dateStr,
      day: cell.day,
      log: log || { mood: null, daily_progress: 0, pos_points: 0, neg_points: 0 }
    });
    setIsHabitsExpanded(false);
  };

  // --- HABIT ACTION WRAPPERS ---
  const handleAddHabit = () => {
    if (!habitName.trim()) return;
    addTask(
      habitName.trim(),
      1,
      'habit',
      0,
      pointsOrDeposit === 'positive' ? 1 : pointsOrDeposit === 'negative' ? -1 : 0
    );
    setHabitName('');
    Keyboard.dismiss();
  };

  // --- PIGGY BANK ACTION WRAPPERS ---
  const handleSavePiggyGoal = () => {
    if (!piggyGoal.trim() || !piggyTarget.trim()) return;
    addTask(piggyGoal.trim(), parseInt(piggyTarget, 10) || 0, 'piggy_bank', 0);
    setPiggyGoal('');
    setPiggyTarget('');
    Keyboard.dismiss();
  };

  const handleUpdatePiggy = (goalId, isAdd) => {
    const inputVal = parseInt(piggyInputs[goalId], 10) || 0;
    statusChangeTask(goalId, isAdd ? inputVal : -inputVal);
    setPiggyInputs(prev => ({ ...prev, [goalId]: '' }));
    Keyboard.dismiss();

    // Clear any previous active flash timer
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
    }

    setFlashingGoalId(goalId);
    flashTimerRef.current = setTimeout(() => {
      setFlashingGoalId(null);
      flashTimerRef.current = null;
    }, 650); // Flash for 750ms (less than a second!)
  };

  // --- TV SHOWS ACTION WRAPPERS ---
  const handleAddShow = () => {
    if (!showTitle.trim()) return;
    addTask(showTitle.trim(), 1, isMovieInput ? 'movie' : 'tv_show', isMovieInput ? "0" : "1-1");
    setShowTitle('');
    setIsMovieInput(false);
    Keyboard.dismiss();
  };

  // Swipe Action Helper
  const renderSwipeLeft = (progress, drag) => {
    return leftAction(progress, drag, 'toRecycle');
  };

  const allHabits = useMemo(() =>
    todoList.filter(item => item.type === 'habit' && !item.deleted),
    [todoList]
  );

  const dayHabits = useMemo(() => {
    if (!selectedDayDetail) return [];
    if (selectedDayDetail.dateStr === todayStr) {
      return allHabits.map(item => ({
        id: item.id,
        text: item.text,
        contribution: item.contribution,
        progressNow: parseInt(item.progressNow, 10) || 0
      }));
    }
    if (!selectedDayDetail.log || !selectedDayDetail.log.habits_detail) {
      return [];
    }
    try {
      const parsed = typeof selectedDayDetail.log.habits_detail === 'string'
        ? JSON.parse(selectedDayDetail.log.habits_detail)
        : selectedDayDetail.log.habits_detail;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.log('Error parsing habits_detail:', e);
      return [];
    }
  }, [selectedDayDetail, allHabits, todayStr]);

  const displayNeuPoints = useMemo(() => {
    if (selectedDayDetail?.dateStr === todayStr) {
      return dailyStats.neutralCount;
    }
    return dayHabits
      .filter(h => h.contribution === 0)
      .reduce((sum, h) => sum + (parseInt(h.progressNow, 10) || 0), 0);
  }, [selectedDayDetail, todayStr, dailyStats.neutralCount, dayHabits]);

  // --- RENDERING SUBTABS ---

  if (subtab === 'habits') {
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
            placeholder=" Новая привычка..."
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
  }

  if (subtab === 'piggy_bank') {
    return (
      <View style={styles.container}>
        <View style={{ marginTop: 10 }} />

        <View style={styles.piggyInputRowContainer}>
          <View style={styles.piggyInputColumn}>
            <TextInput
              style={[styles.input, { flex: 0, width: '100%', marginBottom: 0 }]}
              placeholder=" Название цели"
              placeholderTextColor="#94A3B8"
              cursorColor={theme.colors.icon.primary}
              selectionColor={theme.colors.icon.primary}
              value={piggyGoal}
              onChangeText={setPiggyGoal}
            />
            <TextInput
              style={[styles.input, { flex: 0, width: '100%', marginBottom: 0 }]}
              placeholder=" Целевая сумма"
              placeholderTextColor="#94A3B8"
              cursorColor={theme.colors.icon.primary}
              selectionColor={theme.colors.icon.primary}
              keyboardType="numeric"
              value={piggyTarget}
              onChangeText={setPiggyTarget}
            />
          </View>

          <TouchableOpacity style={styles.piggyCreateRightButton} onPress={handleSavePiggyGoal}>
            <Text style={styles.piggyCreateRightButtonText}>Создать{"\n"}цель</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={piggyGoalItems}
          bounces={false}
          overScrollMode="never"
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 6, paddingBottom: isKeyboardVisible ? keyboardHeight : 0 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => {
            const isCompleted = (item.progressNow || 0) >= item.progressEnd;
            const progressPercent = isCompleted
              ? 100
              : Math.max(0, Math.min(99, Math.floor(((item.progressNow || 0) / item.progressEnd) * 100)));
            return (
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
              >
                <View style={styles.piggyCardCompact}>
                  {/* Seamless Header Banner containing the Goal Title and Inset Progress Bar */}
                  <View style={styles.piggyCardHeader}>
                    <Text style={styles.piggyTitleText}>
                      {item.text}
                    </Text>

                    {/* Dynamic Progress Bar Inset inside the Header Banner */}
                    <View style={styles.piggyCardProgressBarTrack}>
                      <View style={[
                        styles.piggyCardProgressBarFill,
                        { width: `${progressPercent}%` }
                      ]} />
                    </View>
                  </View>

                  {/* Card Body */}
                  <View style={styles.piggyCardBody}>
                    {/* Row 1: Three equal columns (Target badge left, Current blue center, Sum Input right) */}
                    <View style={styles.piggyRowOne}>
                      <View style={styles.piggyLeftColumnCompact}>
                        <View style={styles.piggyTargetBadge}>
                          <Text style={styles.piggyTargetTextCompact} numberOfLines={1} adjustsFontSizeToFit={true}>
                            {item.progressEnd}
                          </Text>
                        </View>
                        {/* Perfect floating vertical divider that doesn't affect flex layout calculations */}
                        <View style={styles.piggyVerticalDivider} />
                      </View>

                      <View style={styles.piggyCenterColumnCompact}>
                        <View style={[
                          styles.piggyCurrentContainerCompact,
                          isCompleted && styles.piggyCurrentContainerCompactCompleted,
                          flashingGoalId === item.id && { borderColor: theme.colors.icon.primary }
                        ]}>
                          <Text style={[
                            styles.piggyCurrentTextCompact,
                            (isCompleted || flashingGoalId === item.id) && { color: theme.colors.icon.primary }
                          ]} numberOfLines={1} adjustsFontSizeToFit={true}>
                            {item.progressNow || 0}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.piggyRightColumnCompact}>
                        <TextInput
                          style={[
                            styles.piggyInputCompact,
                            focusedGoalId === item.id && styles.piggyInputCompactFocused,
                            isCompleted && { backgroundColor: theme.colors.icon.bg },
                            flashingGoalId === item.id && { borderColor: theme.colors.icon.primary }
                          ]}
                          placeholder="" // empty placeholder as we have the coin icon overlay!
                          keyboardType="numeric"
                          cursorColor={theme.colors.icon.primary}
                          selectionColor={theme.colors.icon.primary}
                          value={piggyInputs[item.id] || ''}
                          onChangeText={(text) => setPiggyInputs(prev => ({ ...prev, [item.id]: text }))}
                          onFocus={() => setFocusedGoalId(item.id)}
                        />
                        {!piggyInputs[item.id] && focusedGoalId !== item.id && (
                          <View style={styles.piggyInputCoinsPlaceholder} pointerEvents="none">
                            {isCompleted ? (
                              <>
                                <MaterialIcons name="add-shopping-cart" size={22} color={theme.colors.icon.primary} style={{ marginRight: 2 }} />
                                <MaterialIcons name="store" size={27} color={theme.colors.icon.primary} />
                              </>
                            ) : (
                              <>
                                <FontAwesome5 name="plus" size={12} color={theme.colors.icon.bg} style={{ marginRight: 4 }} />
                                <FontAwesome5 name="coins" size={18} color={theme.colors.icon.bg} />
                              </>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </Swipeable>
            );
          }}
        />

        {isKeyboardVisible && focusedGoalId && (
          <View style={[styles.piggyFloatingContainer, {
            bottom: keyboardHeight - 71,
          }]}>
            <TouchableOpacity
              style={[styles.piggyFloatingBtn, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: '#EF4444' }]}
              onPress={() => handleUpdatePiggy(focusedGoalId, false)}
            >
              <MaterialCommunityIcons name="minus" size={20} color="#EF4444" />
              <Text style={[styles.piggyFloatingBtnText, { color: '#EF4444' }]}>Списать</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.piggyFloatingBtn, { backgroundColor: 'rgba(52, 211, 153, 0.12)', borderColor: '#34D399' }]}
              onPress={() => handleUpdatePiggy(focusedGoalId, true)}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#34D399" />
              <Text style={[styles.piggyFloatingBtnText, { color: '#34D399' }]}>Внести</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  if (subtab === 'tv_shows') {
    return (
      <View style={styles.container}>
        <View style={{ marginTop: 10 }} />

        <View style={styles.inputBlock}>
          <TextInput
            style={styles.input}
            placeholder=" Что смотрим?"
            placeholderTextColor="#94A3B8"
            cursorColor={theme.colors.icon.primary}
            selectionColor={theme.colors.icon.primary}
            value={showTitle}
            onChangeText={setShowTitle}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddShow}>
            <MaterialCommunityIcons
              style={{ borderRadius: 10, backgroundColor: theme.colors.icon.bg }}
              name={'plus-thick'}
              size={24}
              color={theme.colors.icon.primary}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={activeShows}
          bounces={false}
          overScrollMode="never"
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 6, paddingBottom: 80 }}
          delaysContentTouches={false}
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
            >
              <View style={styles.showCard}>
                {item.type === 'movie' ? (
                  <View style={[
                    styles.showTitleBlock,
                    { borderBottomLeftRadius: theme.radius.xl, borderBottomRightRadius: theme.radius.xl },
                    item.completed && { backgroundColor: theme.colors.icon.bg }
                  ]}>
                    <Text style={[
                      styles.showTitle,
                      { flex: 1, textAlign: 'left', marginRight: 48, marginBottom: 0 }
                    ]}>
                      {item.text}
                    </Text>
                    <TouchableOpacity
                      onPress={() => statusChangeTask(item.id)}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 48,
                        backgroundColor: theme.colors.icon.bg,
                        borderTopRightRadius: theme.radius.xl,
                        borderBottomRightRadius: theme.radius.xl,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                      <MaterialCommunityIcons
                        name={item.completed ? 'check-bold' : 'check'}
                        size={22}
                        color={theme.colors.icon.primary}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={[
                      styles.showTitleBlock,
                      item.completed && { backgroundColor: theme.colors.icon.bg }
                    ]}>
                      <Text style={[
                        styles.showTitle,
                        { flex: 1, textAlign: 'left', marginRight: 48 }
                      ]}>
                        {item.text}
                      </Text>
                      <TouchableOpacity
                        onPress={() => statusChangeTask(item.id, 'toggle_complete')}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: 48,
                          backgroundColor: theme.colors.icon.bg,
                          borderTopRightRadius: theme.radius.xl,
                          borderBottomRightRadius: 0,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                      >
                        <MaterialCommunityIcons
                          name={item.completed ? 'check-bold' : 'check'}
                          size={22}
                          color={theme.colors.icon.primary}
                        />
                      </TouchableOpacity>
                    </View>
                    {(() => {
                      let [season, episode] = (item.progressNow || "1-1").toString().split('-').map(Number);
                      if (isNaN(season)) season = 1;
                      if (isNaN(episode)) episode = 1;

                      return (
                        <View style={styles.showControlsRow}>
                          <View style={styles.showControlGroupLeft}>
                            <TouchableOpacity
                              disabled={item.completed}
                              onPress={() => statusChangeTask(item.id, -1, 'season')}
                              style={[styles.showControlBtn, styles.showControlBtnLeft]}
                            >
                              <Ionicons name="remove" size={22} color={item.completed ? '#94A3B8' : theme.colors.primary} />
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                              <Text style={styles.showControlLabel}>Сезон</Text>
                              <Text style={styles.showControlValue}>{season}</Text>
                            </View>
                            <TouchableOpacity
                              disabled={item.completed}
                              onPress={() => statusChangeTask(item.id, 1, 'season')}
                              style={[styles.showControlBtn, styles.showControlBtnCenterLeft]}
                            >
                              <Ionicons name="add" size={22} color={item.completed ? '#94A3B8' : theme.colors.primary} />
                            </TouchableOpacity>
                          </View>

                          <View style={styles.showControlGroupRight}>
                            <TouchableOpacity
                              disabled={item.completed}
                              onPress={() => statusChangeTask(item.id, -1, 'episode')}
                              style={[styles.showControlBtn, styles.showControlBtnCenterRight]}
                            >
                              <Ionicons name="remove" size={22} color={item.completed ? '#94A3B8' : theme.colors.primary} />
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                              <Text style={styles.showControlLabel}>Серия</Text>
                              <Text style={styles.showControlValue}>{episode}</Text>
                            </View>
                            <TouchableOpacity
                              disabled={item.completed}
                              onPress={() => statusChangeTask(item.id, 1, 'episode')}
                              style={[styles.showControlBtn, styles.showControlBtnRight]}
                            >
                              <Ionicons name="add" size={22} color={item.completed ? '#94A3B8' : theme.colors.primary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })()}
                  </>
                )}
              </View>
            </Swipeable>
          )}
        />
        <View style={[styles.keyboardSuggestionBar, {
          bottom: keyboardHeight - 71,
          opacity: isKeyboardVisible ? 1 : 0
        }]}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            onPress={() => setIsMovieInput(prev => !prev)}
            activeOpacity={0.8}
          >
            <Text style={styles.keyboardSuggestionText}>Это фильм?</Text>
            <View style={[
              styles.keyboardSuggestionCheckbox,
              isMovieInput && styles.keyboardSuggestionCheckboxChecked
            ]}>
              {isMovieInput && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- DASHBOARD (DEFAULT VIEW) ---


  const hasTodayMood = todayMood && activeMoodConfig[todayMood];
  const dateBtnBg = hasTodayMood ? activeMoodConfig[todayMood].dashboardBg : theme.colors.primaryLight;
  const dateBtnBorder = hasTodayMood ? activeMoodConfig[todayMood].color : theme.colors.primary;
  const dateBtnTextColor = hasTodayMood ? activeMoodConfig[todayMood].color : theme.colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.dashboardContainer}>
        {/* Central Date and Stats Block */}
        <View style={styles.centralDateBlock}>
          <View style={styles.dashboardRow}>
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: dateBtnBg,
                  borderColor: dateBtnBorder,
                }
              ]}
              onPress={() => setCalendarVisible(true)}
            >
              <Text style={[styles.dateNumber, { color: dateBtnTextColor }]}>{today.getDate()}</Text>
              <Text style={[styles.dateMonth, { color: dateBtnTextColor }]}>{currentMonthGenitive}</Text>
            </TouchableOpacity>

            <View style={styles.dashboardStatsColumn}>
              <View style={styles.statItemRow}>
                <Text style={styles.statLabel}>Прогресс дня</Text>
                <Text style={styles.statValue}>{dailyStats.dailiesProgress}%</Text>
              </View>
              <View style={styles.statItemRow}>
                <Text style={styles.statLabel}>Привычки</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.statValue, { color: '#34D399' }]}>+{dailyStats.positiveCount}</Text>
                  <Text style={[styles.statValue, { color: '#94A3B8', marginHorizontal: 8 }]}>{dailyStats.neutralCount}</Text>
                  <Text style={[styles.statValue, { color: '#EF4444' }]}>-{dailyStats.negativeCount}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Dashboard Grid Menu Cards */}
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.menuCard} onPress={() => setSubtab('habits')}>
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="shield-star-outline" size={45} color={theme.colors.icon.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Привычки</Text>
              <Text style={styles.menuSubtitle}>Счётчики хороших и плохих дел, которые имеют свойство повторяться</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={() => setSubtab('piggy_bank')}>
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="piggy-bank-outline" size={45} color={theme.colors.icon.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Копилка</Text>
              <Text style={styles.menuSubtitle}>Копи деньги на крупные цели</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={() => setSubtab('tv_shows')}>
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="television-play" size={45} color={theme.colors.icon.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Сериалы</Text>
              <Text style={styles.menuSubtitle}>Отмечай фильмы и сериалы</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Month Grid Calendar Modal */}
      <Modal
        visible={isCalendarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setCalendarVisible(false);
          setSelectedDayDetail(null);
          setIsHabitsExpanded(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

            {/* Pinned Absolute Close Button */}
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 10,
              }}
              onPress={() => {
                setCalendarVisible(false);
                setSelectedDayDetail(null);
                setIsHabitsExpanded(false);
              }}
            >
              <Ionicons
                style={{
                  padding: 4,
                  borderBottomLeftRadius: 14,
                  borderTopRightRadius: 14,
                  backgroundColor: theme.colors.icon.bg,
                }}
                name="close"
                size={40}
                color={theme.colors.icon.primary}
              />
            </TouchableOpacity>

            {/* Pinned Absolute Month/Year Title */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 10,
                backgroundColor: theme.colors.icon.bg,
                borderBottomRightRadius: 14,
                borderTopLeftRadius: 14,
                paddingVertical: 10,
                paddingHorizontal: 18,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: theme.colors.text.primary,
                  textTransform: 'uppercase',
                }}
              >
                {currentMonthName} {today.getFullYear()}
              </Text>
            </View>

            {/* Layout spacer to push calendar grid below absolute top header elements */}
            <View style={{ height: 38 }} />

            {/* Grid Calendar mapping */}
            <View style={styles.calendarGrid}>
              {calendarCells.map((cell, index) => {
                const dayLog = cell.dateStr ? rpgHistory.find(h => h.date === cell.dateStr) : null;
                const hasCellMood = dayLog && activeMoodConfig[dayLog.mood];

                const cellBg = hasCellMood ? activeMoodConfig[dayLog.mood].glassBg : (cell.day ? theme.colors.border.light : 'transparent');
                const cellBorderColor = hasCellMood ? activeMoodConfig[dayLog.mood].color : 'transparent';
                const cellTextColor = hasCellMood ? activeMoodConfig[dayLog.mood].color : theme.colors.text.secondary;
                const cellBorderWidth = hasCellMood ? 1.5 : 0;

                return (
                  <TouchableOpacity
                    key={index}
                    disabled={!cell.day}
                    style={[
                      styles.calendarCell,
                      {
                        backgroundColor: cellBg,
                        borderColor: cellBorderColor,
                        borderWidth: cellBorderWidth,
                      }
                    ]}
                    onPress={() => handleDayPress(cell)}
                  >
                    {cell.day && (
                      <Text style={[
                        styles.calendarCellText,
                        {
                          color: cellTextColor,
                          fontWeight: hasCellMood ? 'bold' : '600',
                        }
                      ]}>
                        {cell.day}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Day Specific statistics view */}
            {selectedDayDetail && (
              <View style={styles.dayDetailBlock}>
                <Text style={styles.dayDetailTitle}>
                  Сводка за {selectedDayDetail.day} {currentMonthGenitive}
                </Text>

                <View style={styles.dayDetailGrid}>
                  <View style={styles.dayDetailItem}>
                    <Text style={styles.statLabel}>Настроение</Text>
                    {selectedDayDetail.log.mood ? (
                      <MaterialCommunityIcons
                        name={activeMoodConfig[selectedDayDetail.log.mood].icon}
                        size={28}
                        color={activeMoodConfig[selectedDayDetail.log.mood].color}
                        style={{ marginTop: 4 }}
                      />
                    ) : (
                      <Text style={styles.dayDetailValue}>—</Text>
                    )}
                  </View>

                  <View style={styles.dayDetailItem}>
                    <Text style={styles.statLabel}>Прогресс</Text>
                    <Text style={[styles.dayDetailValue, { color: theme.colors.primary }]}>
                      {displayProgress}%
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.dayDetailItem}
                    onPress={() => setIsHabitsExpanded(prev => !prev)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.statLabel}>Привычки</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Text style={[styles.dayDetailValue, { color: '#34D399', marginTop: 0 }]}>
                        +{displayPosPoints}
                      </Text>
                      <Text style={[styles.dayDetailValue, { color: '#94A3B8', marginTop: 0, marginHorizontal: 8 }]}>
                        {displayNeuPoints}
                      </Text>
                      <Text style={[styles.dayDetailValue, { color: '#EF4444', marginTop: 0 }]}>
                        -{displayNegPoints}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={isHabitsExpanded ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color="#94A3B8"
                      style={{ marginTop: 2 }}
                    />
                  </TouchableOpacity>
                </View>

                {isHabitsExpanded && (
                  <View style={{
                    marginTop: 6,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border.light,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border.light,
                    maxHeight: 206, // set a sleek scrollable limit
                  }}>
                    {dayHabits.length > 0 ? (
                      <FlatList
                        data={dayHabits}
                        bounces={false}
                        overScrollMode="never"
                        keyExtractor={(habit, idx) => habit.id || idx.toString()}
                        contentContainerStyle={{ gap: 6, paddingVertical: 6 }}
                        renderItem={({ item: habit }) => {
                          const iconBg = habit.contribution === 1
                            ? 'rgba(52, 211, 153, 0.12)'
                            : habit.contribution === -1
                              ? 'rgba(239, 68, 68, 0.12)'
                              : 'rgba(148, 163, 184, 0.12)';

                          const iconColor = habit.contribution === 1
                            ? '#34D399'
                            : habit.contribution === -1
                              ? '#EF4444'
                              : '#94A3B8';

                          const iconName = habit.contribution === 1
                            ? 'plus'
                            : habit.contribution === -1
                              ? 'minus'
                              : 'help';

                          return (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: theme.colors.surface,
                                borderRadius: 10,
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                borderWidth: 1,
                                borderColor: theme.colors.border.light,
                              }}
                            >
                              <View style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                backgroundColor: iconBg,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10,
                              }}>
                                <MaterialCommunityIcons name={iconName} size={15} color={iconColor} />
                              </View>
                              <Text style={{
                                flex: 1,
                                fontSize: 14,
                                color: theme.colors.text.primary,
                                fontWeight: '500'
                              }}>
                                {habit.text}
                              </Text>
                              <Text style={{
                                fontSize: 14,
                                fontWeight: 'bold',
                                color: theme.colors.text.secondary
                              }}>
                                {habit.progressNow || 0}
                              </Text>
                            </View>
                          );
                        }}
                      />
                    ) : (
                      <Text style={{
                        fontSize: 13,
                        color: '#94A3B8',
                        textAlign: 'center',
                        fontStyle: 'italic',
                        marginTop: 4
                      }}>
                        Нет записанных привычек за этот день
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}

          </View>
        </View>
      </Modal>

    </View>
  );
};
