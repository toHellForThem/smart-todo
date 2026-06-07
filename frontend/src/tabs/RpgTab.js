import { useState, useEffect, useMemo, useRef, memo } from 'react';
import { View, Text, TouchableOpacity, Keyboard, LayoutAnimation, Platform, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStyles } from './RpgTab.styles';
import { useAppTheme, useStyles } from '../theme/ThemeContext';
import { getLogicalDateStr } from '../utils/date';
import { useTranslation } from '../utils/LanguageContext';

import { CalendarModal } from '../components/CalendarModal';
import { HabitsSubtab } from './rpg/HabitsSubtab';
import { PiggyBankSubtab } from './rpg/PiggyBankSubtab';
import { TvShowsSubtab } from './rpg/TvShowsSubtab';
import { useShortcuts } from '../hooks/useShortcuts';

export const RpgTab = memo(({
  rpgHistory,
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
  showIsMovie,
  setShowIsMovie,
  showStartEpisode,
  setShowStartEpisode,
  isWideScreen,
  focusedGoalId,
  setFocusedGoalId,
  flashingGoalId,
  piggyInputs,
  setPiggyInputs,
  handleUpdatePiggy,
  selectedTaskId,
  focusInputTrigger,
  isActive,
}) => {
  const styles = useStyles(getStyles);
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const isDark = settings?.theme === 'dark';

  const activeMoodConfig = useMemo(() => {
    const isMint = settings?.theme === 'mint';
    const isPink = settings?.theme === 'pink';
    if (isDark) {
      return {
        1: { icon: 'emoticon-dead-outline', color: '#94A3B8', glassBg: '#334155', dashboardBg: '#1E293B', label: t('mood_1') },
        2: { icon: 'emoticon-sad-outline', color: '#FB7185', glassBg: '#4c0519', dashboardBg: '#881337', label: t('mood_2') },
        3: { icon: 'emoticon-neutral-outline', color: '#F59E0B', glassBg: '#451a03', dashboardBg: '#78350f', label: t('mood_3') },
        4: { icon: 'emoticon-happy-outline', color: '#34D399', glassBg: '#064e3b', dashboardBg: '#065f46', label: t('mood_4') },
        5: { icon: 'emoticon-excited-outline', color: '#C084FC', glassBg: '#2e1065', dashboardBg: '#4c1d95', label: t('mood_5') },
      };
    } else if (isMint) {
      return {
        1: { icon: 'emoticon-dead-outline', color: '#64748B', glassBg: '#EDF2F7', dashboardBg: '#E2E8F0', label: t('mood_1') },
        2: { icon: 'emoticon-sad-outline', color: '#F43F5E', glassBg: '#FFE4E6', dashboardBg: '#FECDD3', label: t('mood_2') },
        3: { icon: 'emoticon-neutral-outline', color: '#D98A2F', glassBg: '#FEF3C7', dashboardBg: '#FDE68A', label: t('mood_3') },
        4: { icon: 'emoticon-happy-outline', color: '#10B981', glassBg: '#D1FAE5', dashboardBg: '#A7F3D0', label: t('mood_4') },
        5: { icon: 'emoticon-excited-outline', color: '#8B5CF6', glassBg: '#EDE9FE', dashboardBg: '#DDD6FE', label: t('mood_5') },
      };
    } else if (isPink) {
      return {
        1: { icon: 'emoticon-dead-outline', color: '#64748B', glassBg: '#EDF2F7', dashboardBg: '#E2E8F0', label: t('mood_1') },
        2: { icon: 'emoticon-sad-outline', color: '#F43F5E', glassBg: '#FFE4E6', dashboardBg: '#FFD2E2', label: t('mood_2') },
        3: { icon: 'emoticon-neutral-outline', color: '#D98A2F', glassBg: '#FEF3C7', dashboardBg: '#FFEBC4', label: t('mood_3') },
        4: { icon: 'emoticon-happy-outline', color: '#10B981', glassBg: '#D1FAE5', dashboardBg: '#E6F4EA', label: t('mood_4') },
        5: { icon: 'emoticon-excited-outline', color: '#D946EF', glassBg: '#FDF4FF', dashboardBg: '#FAE8FF', label: t('mood_5') },
      };
    } else {
      return {
        1: { icon: 'emoticon-dead-outline', color: '#64748B', glassBg: '#EDF2F7', dashboardBg: '#CBD9EF', label: t('mood_1') },
        2: { icon: 'emoticon-sad-outline', color: '#F43F5E', glassBg: '#FFE4E6', dashboardBg: '#DCD2E9', label: t('mood_2') },
        3: { icon: 'emoticon-neutral-outline', color: '#D98A2F', glassBg: '#FEF3C7', dashboardBg: '#D9DCE4', label: t('mood_3') },
        4: { icon: 'emoticon-happy-outline', color: '#10B981', glassBg: '#D1FAE5', dashboardBg: '#C1E1EE', label: t('mood_4') },
        5: { icon: 'emoticon-excited-outline', color: '#8B5CF6', glassBg: '#EDE9FE', dashboardBg: '#CFD6FC', label: t('mood_5') },
      };
    }
  }, [isDark, settings?.theme, t]);

  const [selectedDayDetail, setSelectedDayDetail] = useState(null);
  const [isHabitsExpanded, setIsHabitsExpanded] = useState(false);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const flatListRef = useRef(null);
  const currentScrollY = useRef(0);

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => getLogicalDateStr(settings?.reset_time), [settings?.reset_time]);

  const [viewDate, setViewDate] = useState(() => new Date());

  useEffect(() => {
    if (isCalendarVisible) {
      setViewDate(new Date());
    }
  }, [isCalendarVisible]);

  const handlePrevMonth = () => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
    setSelectedDayDetail(null);
    setIsHabitsExpanded(false);
  };

  const handleNextMonth = () => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
    setSelectedDayDetail(null);
    setIsHabitsExpanded(false);
  };

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

  useEffect(() => {
    if (isKeyboardVisible) {
      if (focusedIndex >= 1 && flatListRef.current) {
        const timer = setTimeout(() => {
          try {
            flatListRef.current.scrollToIndex({
              index: focusedIndex,
              viewPosition: 0.2,
              animated: true,
            });
          } catch (err) {
            try {
              flatListRef.current.scrollToOffset({
                offset: focusedIndex * 70,
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

  const dailyStats = useMemo(() => {
    const parts = todayStr.split('-').map(Number);
    const logicalDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const logicalDayIdx = (logicalDate.getDay() + 6) % 7;

    const dailies = todoList.filter(item => {
      if (item.type !== 'daily' || item.deleted) return false;
      const daysStr = item.days || '1111111';
      return daysStr[logicalDayIdx] === '1';
    });

    const hasAnyDaily = todoList.some(item => item.type === 'daily' && !item.deleted);

    let dailiesProgress = 0;
    if (dailies.length > 0) {
      const { needProgress, nowProgress } = dailies.reduce((acc, item) => {
        acc.needProgress += (item.progressEnd || 0);
        acc.nowProgress += (item.progressNow || 0);
        return acc;
      }, { needProgress: 0, nowProgress: 0 });
      dailiesProgress = Math.round((nowProgress / needProgress) * 100);
    } else if (hasAnyDaily) {
      dailiesProgress = 100;
    }

    const positiveCount = positiveHabits.reduce((sum, h) => sum + (parseInt(h.progressNow, 10) || 0), 0);
    const negativeCount = negativeHabits.reduce((sum, h) => sum + (parseInt(h.progressNow, 10) || 0), 0);
    const neutralCount = neutralHabits.reduce((sum, h) => sum + (parseInt(h.progressNow, 10) || 0), 0);

    return {
      dailiesProgress,
      positiveCount,
      negativeCount,
      neutralCount,
    };
  }, [todoList, positiveHabits, negativeHabits, neutralHabits, todayStr]);

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

  const todayMonthGenitive = useMemo(() => t('months_genitive')[today.getMonth()], [today, t]);

  const currentMonthName = useMemo(() => t('months')[viewDate.getMonth()], [viewDate, t]);

  const selectedDayMonthGenitive = useMemo(() => {
    if (!selectedDayDetail?.dateStr) return '';
    const parts = selectedDayDetail.dateStr.split('-');
    const m = parseInt(parts[1], 10) - 1;
    return t('months_genitive')[m] || '';
  }, [selectedDayDetail, t]);

  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const cells = [];
    for (let i = 0; i < offset; i++) {
      cells.push({ day: null, dateStr: null });
    }
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ day, dateStr });
    }
    return cells;
  }, [viewDate]);

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

  const calendarShortcuts = useMemo(() => {
    const map = {};
    if (!isCalendarVisible) return map;

    const navigateDay = (offset) => {
      let targetCell = null;
      if (!selectedDayDetail?.dateStr) {
        targetCell = calendarCells.find(c => c.dateStr === todayStr);
        if (!targetCell) {
          targetCell = calendarCells.find(c => c.day !== null);
        }
      } else {
        const currentIndex = calendarCells.findIndex(c => c.dateStr === selectedDayDetail.dateStr);
        if (currentIndex !== -1) {
          const targetIndex = currentIndex + offset;
          if (targetIndex >= 0 && targetIndex < calendarCells.length) {
            const cell = calendarCells[targetIndex];
            if (cell && cell.day !== null) {
              targetCell = cell;
            }
          }
        }
      }

      if (targetCell) {
        handleDayPress(targetCell);
      }
    };

    map['arrowleft'] = (e) => {
      e.preventDefault();
      navigateDay(-1);
    };

    map['arrowright'] = (e) => {
      e.preventDefault();
      navigateDay(1);
    };

    map['arrowup'] = (e) => {
      e.preventDefault();
      navigateDay(-7);
    };

    map['arrowdown'] = (e) => {
      e.preventDefault();
      navigateDay(7);
    };

    map['enter'] = (e) => {
      e.preventDefault();
      setIsHabitsExpanded(prev => !prev);
    };
    map['space'] = (e) => {
      e.preventDefault();
      setIsHabitsExpanded(prev => !prev);
    };

    return map;
  }, [isCalendarVisible, calendarCells, selectedDayDetail, handleDayPress, setIsHabitsExpanded, todayStr]);

  useShortcuts(calendarShortcuts);

  const handleAddHabit = (name, type) => {
    addTask(
      name.trim(),
      1,
      'habit',
      0,
      type === 'positive' ? 1 : type === 'negative' ? -1 : 0
    );
    Keyboard.dismiss();
  };

  const handleSavePiggyGoal = (goal, target) => {
    addTask(goal.trim(), parseInt(target, 10) || 0, 'piggy_bank', 0);
    Keyboard.dismiss();
  };


  const handleAddShow = (title, isMovie, startEp) => {
    const epNum = parseInt(startEp, 10) || 1;
    addTask(title.trim(), 1, isMovie ? 'movie' : 'tv_show', isMovie ? "0" : `1-${epNum}`);
    Keyboard.dismiss();
  };

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
      return allHabits
        .map(item => ({
          id: item.id,
          text: item.text,
          contribution: item.contribution,
          progressNow: parseInt(item.progressNow, 10) || 0
        }))
        .filter(h => h.progressNow !== 0);
    }
    if (!selectedDayDetail.log || !selectedDayDetail.log.habits_detail) {
      return [];
    }
    try {
      const parsed = typeof selectedDayDetail.log.habits_detail === 'string'
        ? JSON.parse(selectedDayDetail.log.habits_detail)
        : selectedDayDetail.log.habits_detail;
      const list = Array.isArray(parsed) ? parsed : [];
      return list
        .map(h => ({
          id: h.id,
          text: h.text,
          contribution: h.contribution,
          progressNow: parseInt(h.progressNow, 10) || 0
        }))
        .filter(h => h.progressNow !== 0);
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

  if (subtab === 'habits') {
    return (
      <HabitsSubtab
        allHabits={allHabits}
        handleAddHabit={handleAddHabit}
        statusChangeTask={statusChangeTask}
        deleteToRecycle={deleteToRecycle}
        renderSwipeLeft={renderSwipeLeft}
        styles={styles}
        theme={theme}
        t={t}
        selectedTaskId={selectedTaskId}
        focusInputTrigger={focusInputTrigger}
        isActive={isActive && subtab === 'habits'}
      />
    );
  }

  if (subtab === 'piggy_bank') {
    return (
      <PiggyBankSubtab
        piggyGoalItems={piggyGoalItems}
        focusedGoalId={focusedGoalId}
        setFocusedGoalId={setFocusedGoalId}
        flashingGoalId={flashingGoalId}
        isKeyboardVisible={isKeyboardVisible}
        keyboardHeight={keyboardHeight}
        handleSavePiggyGoal={handleSavePiggyGoal}
        handleUpdatePiggy={handleUpdatePiggy}
        handleScroll={handleScroll}
        flatListRef={flatListRef}
        deleteToRecycle={deleteToRecycle}
        renderSwipeLeft={renderSwipeLeft}
        styles={styles}
        theme={theme}
        t={t}
        piggyInputs={piggyInputs}
        setPiggyInputs={setPiggyInputs}
        selectedTaskId={selectedTaskId}
        focusInputTrigger={focusInputTrigger}
        isActive={isActive && subtab === 'piggy_bank'}
      />
    );
  }

  if (subtab === 'tv_shows') {
    return (
      <TvShowsSubtab
        activeShows={activeShows}
        keyboardHeight={keyboardHeight}
        isKeyboardVisible={isKeyboardVisible}
        handleAddShow={handleAddShow}
        statusChangeTask={statusChangeTask}
        deleteToRecycle={deleteToRecycle}
        renderSwipeLeft={renderSwipeLeft}
        styles={styles}
        theme={theme}
        t={t}
        showIsMovie={showIsMovie}
        setShowIsMovie={setShowIsMovie}
        showStartEpisode={showStartEpisode}
        setShowStartEpisode={setShowStartEpisode}
        isWideScreen={isWideScreen}
        selectedTaskId={selectedTaskId}
        focusInputTrigger={focusInputTrigger}
        isActive={isActive && subtab === 'tv_shows'}
      />
    );
  }

  const hasTodayMood = todayMood && activeMoodConfig[todayMood];
  const dateBtnBg = hasTodayMood ? activeMoodConfig[todayMood].dashboardBg : theme.colors.surface;
  const dateBtnBorder = hasTodayMood ? activeMoodConfig[todayMood].color : theme.colors.primary;
  const dateBtnTextColor = hasTodayMood ? activeMoodConfig[todayMood].color : theme.colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.dashboardContainer}>
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
              <Text style={[styles.dateMonth, { color: dateBtnTextColor }]}>{todayMonthGenitive}</Text>
            </TouchableOpacity>

            <View style={styles.dashboardStatsColumn}>
              <View style={styles.statItemRow}>
                <Text style={styles.statLabel}>{t('rpg_stat_progress')}</Text>
                <Text style={styles.statValue}>{dailyStats.dailiesProgress}%</Text>
              </View>
              <View style={styles.statItemRow}>
                <Text style={styles.statLabel}>{t('rpg_stat_habits')}</Text>
                <View style={styles.statHabitsValueContainer}>
                  <Text style={[styles.statValue, { color: '#34D399' }]}>+{dailyStats.positiveCount}</Text>
                  <Text style={[styles.statValue, { color: '#94A3B8', marginHorizontal: 8 }]}>{dailyStats.neutralCount}</Text>
                  <Text style={[styles.statValue, { color: '#EF4444' }]}>-{dailyStats.negativeCount}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.menuCard} onPress={() => setSubtab('habits')}>
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="shield-star-outline" size={45} color={theme.colors.icon.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{t('rpg_menu_habits')}</Text>
              <Text style={styles.menuSubtitle}>{t('rpg_menu_habits_desc')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={() => setSubtab('piggy_bank')}>
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="piggy-bank-outline" size={45} color={theme.colors.icon.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{t('rpg_menu_piggy')}</Text>
              <Text style={styles.menuSubtitle}>{t('rpg_menu_piggy_desc')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuCard} onPress={() => setSubtab('tv_shows')}>
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="television-play" size={45} color={theme.colors.icon.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{t('rpg_menu_tv')}</Text>
              <Text style={styles.menuSubtitle}>{t('rpg_menu_tv_desc')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <CalendarModal
        isCalendarVisible={isCalendarVisible}
        setCalendarVisible={setCalendarVisible}
        currentMonthName={currentMonthName}
        viewDate={viewDate}
        calendarCells={calendarCells}
        selectedDayDetail={selectedDayDetail}
        setSelectedDayDetail={setSelectedDayDetail}
        isHabitsExpanded={isHabitsExpanded}
        setIsHabitsExpanded={setIsHabitsExpanded}
        displayProgress={displayProgress}
        displayPosPoints={displayPosPoints}
        displayNegPoints={displayNegPoints}
        displayNeuPoints={displayNeuPoints}
        dayHabits={dayHabits}
        activeMoodConfig={activeMoodConfig}
        rpgHistory={rpgHistory}
        todayStr={todayStr}
        selectedDayMonthGenitive={selectedDayMonthGenitive}
        handlePrevMonth={handlePrevMonth}
        handleNextMonth={handleNextMonth}
        handleDayPress={handleDayPress}
        styles={styles}
        theme={theme}
        t={t}
      />
    </View>
  );
});
