import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Platform,
  UIManager,
  BackHandler,
  useWindowDimensions,
  Keyboard
} from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { renderLeftAction } from './src/utils/swipe';

import { getStyles } from './App.styles';
import { getTheme } from './src/theme/theme';
import { ThemeContext } from './src/theme/ThemeContext';
import { TodoTab } from './src/tabs/TodoTab';
import { RecycleTab } from './src/tabs/RecycleTab';
import { DailyTab } from './src/tabs/DailyTab';
import { SettingsTab } from './src/tabs/SettingsTab';
import { RpgTab } from './src/tabs/RpgTab';
import { TabBar } from './src/components/TabBar';
import { Header } from './src/components/Header';
import { LanguageProvider } from './src/utils/LanguageContext';

import { useTodoActions } from './src/hooks/useTodoActions';
import { useTodoSocket } from './src/hooks/useTodoSocket';
import { useMoodSheet } from './src/hooks/useMoodSheet';
import { useShortcuts } from './src/hooks/useShortcuts';
import { AuthStorage } from './src/utils/storage';
import { CalendarModal } from './src/components/CalendarModal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TAB_VIEWS = {
  todo: {
    list: (props) => (
      <TodoTab
        onAdd={props.onAdd}
        todoList={props.todoList}
        statusChangeTask={props.statusChangeTask}
        deleteTodo={props.handleDeleteTodo}
        leftAction={props.leftAction}
      />
    ),
  },
  daily: {
    list: (props) => (
      <DailyTab
        todoList={props.todoList}
        setTodoList={props.setTodoList}
        onAdd={props.onAdd}
        statusChangeTask={props.statusChangeTask}
        deleteTodo={props.handleDeleteTodo}
        leftAction={props.leftAction}
        dailyDays={props.dailyDays}
        setDailyDays={props.setDailyDays}
        dailyProgressEnd={props.dailyProgressEnd}
        setDailyProgressEnd={props.setDailyProgressEnd}
        isWideScreen={props.isWideScreen}
      />
    ),
  },
  rpg: {
    list: (props) => (
      <RpgTab
        rpgHistory={props.rpgHistory}
        setRpgHistory={props.setRpgHistory}
        todoList={props.todoList}
        leftAction={props.leftAction}
        deleteToRecycle={props.handleDeleteTodo}
        addTask={props.addTask}
        statusChangeTask={props.statusChangeTask}
        subtab={props.rpgSubtab}
        setSubtab={props.setRpgSubtab}
        isCalendarVisible={props.isCalendarVisible}
        setCalendarVisible={props.setCalendarVisible}
        settings={props.settings}
        showIsMovie={props.showIsMovie}
        setShowIsMovie={props.setShowIsMovie}
        showStartEpisode={props.showStartEpisode}
        setShowStartEpisode={props.setShowStartEpisode}
        isWideScreen={props.isWideScreen}
        focusedGoalId={props.focusedGoalId}
        setFocusedGoalId={props.setFocusedGoalId}
        flashingGoalId={props.flashingGoalId}
        piggyInputs={props.piggyInputs}
        setPiggyInputs={props.setPiggyInputs}
        handleUpdatePiggy={props.handleUpdatePiggy}
      />
    ),
  },
};

const GLOBAL_VIEWS = {
  settings: (props) => (
    <SettingsTab
      authMode={props.authMode}
      setAuthMode={props.setAuthMode}
      authState={props.authState}
      setAuthState={props.setAuthState}
      settings={props.settings}
      setSettings={props.setSettings}
      setTodoList={props.setTodoList}
      setRpgHistory={props.setRpgHistory}
      setMainTab={props.setMainTab}
    />
  ),
  recycle: (props) => (
    <RecycleTab
      context={props.mainTab}
      rpgSubtab={props.rpgSubtab}
      todoList={props.todoList}
      deleteTodo={props.deleteTodo}
      leftAction={props.leftAction}
      setTodoList={props.setTodoList}
    />
  ),
};

export default function App() {
  const [settings, setSettings] = useState(() => AuthStorage.getSettings());
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 900;

  const isDark = settings?.theme === 'dark';
  const theme = useMemo(() => getTheme(settings?.theme), [settings?.theme]);
  const styles = useMemo(() => getStyles(theme), [theme]);

  const moods = useMemo(() => {
    const isMint = settings?.theme === 'mint';
    const isPink = settings?.theme === 'pink';
    if (isDark) {
      return [
        { value: 1, icon: 'emoticon-dead-outline', color: '#94A3B8' },
        { value: 2, icon: 'emoticon-sad-outline', color: '#FB7185' },
        { value: 3, icon: 'emoticon-neutral-outline', color: '#F59E0B' },
        { value: 4, icon: 'emoticon-happy-outline', color: '#34D399' },
        { value: 5, icon: 'emoticon-excited-outline', color: '#C084FC' },
      ];
    } else if (isMint) {
      return [
        { value: 1, icon: 'emoticon-dead-outline', color: '#64748B' },
        { value: 2, icon: 'emoticon-sad-outline', color: '#F43F5E' },
        { value: 3, icon: 'emoticon-neutral-outline', color: '#D98A2F' },
        { value: 4, icon: 'emoticon-happy-outline', color: '#10B981' },
        { value: 5, icon: 'emoticon-excited-outline', color: '#8B5CF6' },
      ];
    } else if (isPink) {
      return [
        { value: 1, icon: 'emoticon-dead-outline', color: '#64748B' },
        { value: 2, icon: 'emoticon-sad-outline', color: '#F43F5E' },
        { value: 3, icon: 'emoticon-neutral-outline', color: '#D98A2F' },
        { value: 4, icon: 'emoticon-happy-outline', color: '#10B981' },
        { value: 5, icon: 'emoticon-excited-outline', color: '#D946EF' },
      ];
    } else {
      return [
        { value: 1, icon: 'emoticon-dead-outline', color: '#64748B' },
        { value: 2, icon: 'emoticon-sad-outline', color: '#F43F5E' },
        { value: 3, icon: 'emoticon-neutral-outline', color: '#D98A2F' },
        { value: 4, icon: 'emoticon-happy-outline', color: '#10B981' },
        { value: 5, icon: 'emoticon-excited-outline', color: '#8B5CF6' },
      ];
    }
  }, [isDark, settings?.theme]);
  const [mainTab, setMainTab] = useState(() => {
    const localSettings = AuthStorage.getSettings();
    return localSettings.main_page || 'todo';
  });
  const [activeView, setActiveView] = useState('list');
  const [authMode, setAuthMode] = useState('local');
  const [authState, setAuthState] = useState('');
  const [focusedGoalId, setFocusedGoalId] = useState(null);
  const [flashingGoalId, setFlashingGoalId] = useState(null);
  const [piggyInputs, setPiggyInputs] = useState({});
  const flashTimerRef = useRef(null);

  const [rpgSubtab, setRpgSubtabState] = useState(() => {
    const localSettings = AuthStorage.getSettings();
    const savedSubtab = localSettings.rpg_subtab;
    if (savedSubtab === 'habits' || savedSubtab === 'piggy_bank' || savedSubtab === 'tv_shows') {
      return savedSubtab;
    }
    return 'dashboard';
  });
  const setRpgSubtab = useCallback((val) => {
    setRpgSubtabState(val);
    setFocusedGoalId(null);
  }, []);

  const [isCalendarVisible, setCalendarVisible] = useState(false);

  const [dailyDays, setDailyDays] = useState('1111111');
  const [dailyProgressEnd, setDailyProgressEnd] = useState(1);
  const [showIsMovie, setShowIsMovie] = useState(false);
  const [showStartEpisode, setShowStartEpisode] = useState('1');

  const {
    todoList,
    setTodoList,
    addTask,
    deleteToRecycle,
    statusChangeTask,
    deleteTodo,
    rpgHistory,
    setRpgHistory,
    handleMoodChange,
  } = useTodoActions(mainTab, settings);

  const handleDeleteTodo = useCallback((id) => {
    if (settings.soft_delete) {
      deleteToRecycle(id);
    } else {
      deleteTodo(id);
    }
  }, [settings.soft_delete, deleteToRecycle, deleteTodo]);

  const handleUpdatePiggy = useCallback((goalId, inputVal, isAdd) => {
    statusChangeTask(goalId, isAdd ? inputVal : -inputVal);
    Keyboard.dismiss();
    
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
    }
    setFlashingGoalId(goalId);
    flashTimerRef.current = setTimeout(() => {
      setFlashingGoalId(null);
      flashTimerRef.current = null;
    }, 650);
  }, [statusChangeTask]);

  useTodoSocket(setTodoList, setAuthMode, setAuthState, setRpgHistory, setSettings, settings, setMainTab);

  const [isMoodSheetOpen, setIsMoodSheetOpen] = useState(false);
  const moodSheet = useMoodSheet(setIsMoodSheetOpen);

  const handleOpenCalendar = () => {
    if (isCalendarVisible) {
      setCalendarVisible(false);
    } else {
      setCalendarVisible(true);
    }
    setMainTab('rpg');
    setRpgSubtab('dashboard');
    setActiveView('list');
  }

  useEffect(() => {
    const backAction = () => {
      if (moodSheet.isActive && moodSheet.isActive.value === 1) {
        moodSheet.closeSheet();
        return true;
      }

      if (isCalendarVisible) {
        setCalendarVisible(false);
        return true;
      }

      if (activeView !== 'list') {
        setActiveView('list');
        return true;
      }

      if (mainTab === 'rpg' && rpgSubtab !== 'dashboard') {
        setRpgSubtab('dashboard');
        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [mainTab, rpgSubtab, activeView, isCalendarVisible, moodSheet]);

  const handleLeftAction = useCallback((prog, drag, mode) => {
    return renderLeftAction(prog, drag, mode, theme, settings?.language || 'ru', settings?.soft_delete !== false);
  }, [theme, settings?.language, settings?.soft_delete]);

  const tabProps = useMemo(() => ({
    onAdd: addTask,
    todoList,
    setTodoList,
    statusChangeTask,
    deleteToRecycle: handleDeleteTodo,
    handleDeleteTodo,
    leftAction: handleLeftAction,
    rpgHistory,
    setRpgHistory,
    addTask,
    rpgSubtab,
    setRpgSubtab,
    isCalendarVisible,
    setCalendarVisible,
    settings,
    dailyDays,
    setDailyDays,
    dailyProgressEnd,
    setDailyProgressEnd,
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
  }), [addTask, todoList, setTodoList, statusChangeTask, handleDeleteTodo, handleLeftAction, rpgHistory, setRpgHistory, rpgSubtab, setRpgSubtab, isCalendarVisible, setCalendarVisible, settings, dailyDays, setDailyDays, dailyProgressEnd, setDailyProgressEnd, showIsMovie, setShowIsMovie, showStartEpisode, setShowStartEpisode, isWideScreen, focusedGoalId, setFocusedGoalId, flashingGoalId, piggyInputs, setPiggyInputs, handleUpdatePiggy]);

  const handleTabChange = (tab) => {
    if (tab === 'rpg') {
      setRpgSubtab('dashboard');
    }
    setMainTab(tab);
    setActiveView('list');
    setFocusedGoalId(null);
  };

  const handleSubtabChange = (subtab) => {
    setMainTab('rpg');
    setRpgSubtab(subtab);
    setActiveView('list');
  }

  const habdleActiveView = (view) => {
    if(activeView === view) {
      setActiveView('list');
    } else {
      setActiveView(view);
    }
  }

  const handleMoodSheet = () => {
    if (moodSheet.isActive && moodSheet.isActive.value === 1){
      moodSheet.isActive = false;
      moodSheet.closeSheet();
    } else {
      moodSheet.isActive = true;
      moodSheet.openSheet();
    }
  }

  const shortcutsMap = {
    'mod+1': () => handleTabChange('rpg'),
    'mod+2': () => handleTabChange('todo'),
    'mod+3': () => handleTabChange('daily'),
    'mod+q': () => handleSubtabChange('habits'),
    'mod+w': () => handleSubtabChange('piggy_bank'),
    'mod+e': () => handleSubtabChange('tv_shows'),
    'mod+r': () => habdleActiveView('recycle'),
    'mod+s': () => habdleActiveView('settings'),
    'mod+c': () => handleOpenCalendar(),
    'mod+x': () => handleMoodSheet(),
  };

  useShortcuts(shortcutsMap);

  const themeContextValue = useMemo(() => ({ theme, isDark }), [theme, isDark]);

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <LanguageProvider language={settings?.language || 'ru'}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
              {Platform.OS === 'web' && (
                <style dangerouslySetInnerHTML={{
                  __html: `
                  body, html, * {
                    user-select: none !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                  }
                  *::-webkit-scrollbar {
                    display: none !important;
                  }
                  * {
                    -ms-overflow-style: none !important;
                    scrollbar-width: none !important;
                  }
                  input, textarea, [contenteditable="true"] {
                    user-select: text !important;
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                    -ms-user-select: text !important;
                  }
                `}} />
              )}
              <Header
                {...moodSheet}
                isMoodSheetOpen={isMoodSheetOpen}
                moods={moods}
                activeView={activeView}
                setActiveView={setActiveView}
                setAuthState={setAuthState}
                setAuthMode={setAuthMode}
                authMode={authMode}
                onMoodChange={handleMoodChange}
                rpgHistory={rpgHistory}
                onOpenCalendar={handleOpenCalendar}
                settings={settings}
                isWideScreen={isWideScreen}
                dailyDays={dailyDays}
                setDailyDays={setDailyDays}
                dailyProgressEnd={dailyProgressEnd}
                setDailyProgressEnd={setDailyProgressEnd}
                showIsMovie={showIsMovie}
                setShowIsMovie={setShowIsMovie}
                showStartEpisode={showStartEpisode}
                setShowStartEpisode={setShowStartEpisode}
                rpgSubtab={rpgSubtab}
                mainTab={mainTab}
                focusedGoalId={focusedGoalId}
                piggyInputs={piggyInputs}
                setPiggyInputs={setPiggyInputs}
                handleUpdatePiggy={handleUpdatePiggy}
              />
              <View style={styles.main} pointerEvents={isMoodSheetOpen ? 'none' : 'auto'}>
                {GLOBAL_VIEWS[activeView] && !(activeView === 'recycle' && isWideScreen) ? (
                  GLOBAL_VIEWS[activeView]({
                    mainTab,
                    rpgSubtab,
                    todoList,
                    deleteTodo,
                    leftAction: handleLeftAction,
                    setTodoList,
                    authMode,
                    setAuthMode,
                    authState,
                    setAuthState,
                    settings,
                    setSettings,
                    setRpgHistory,
                    setMainTab,
                  })
                ) : (
                  isWideScreen ? (
                    <View style={styles.dashboardContainer}>
                      {/* RPG Column */}
                      <View
                        onStartShouldSetResponderCapture={() => { if (mainTab !== 'rpg') handleTabChange('rpg'); return false; }}
                        style={[styles.column, mainTab === 'rpg' && styles.activeColumn]}
                      >
                        <View style={styles.columnHeader}>
                          <Text style={styles.columnTitle}>
                            {settings?.language === 'ru' ? '⚔️ РПГ-режим' : '⚔️ RPG Mode'}
                          </Text>
                        </View>
                        <View style={styles.columnContent}>
                          {mainTab === 'rpg' && activeView === 'recycle' ? (
                            <RecycleTab
                              context="rpg"
                              rpgSubtab={rpgSubtab}
                              todoList={todoList}
                              deleteTodo={deleteTodo}
                              leftAction={handleLeftAction}
                              setTodoList={setTodoList}
                            />
                          ) : (
                            TAB_VIEWS.rpg.list(tabProps)
                          )}
                        </View>
                      </View>

                      {/* Todo Column */}
                      <View
                        onStartShouldSetResponderCapture={() => { if (mainTab !== 'todo') handleTabChange('todo'); return false; }}
                        style={[styles.column, mainTab === 'todo' && styles.activeColumn]}
                      >
                        <View style={styles.columnHeader}>
                          <Text style={styles.columnTitle}>
                            {settings?.language === 'ru' ? '📝 Список дел' : '📝 To-Do List'}
                          </Text>
                        </View>
                        <View style={styles.columnContent}>
                          {mainTab === 'todo' && activeView === 'recycle' ? (
                            <RecycleTab
                              context="todo"
                              rpgSubtab={rpgSubtab}
                              todoList={todoList}
                              deleteTodo={deleteTodo}
                              leftAction={handleLeftAction}
                              setTodoList={setTodoList}
                            />
                          ) : (
                            TAB_VIEWS.todo.list(tabProps)
                          )}
                        </View>
                      </View>

                      {/* Daily Column */}
                      <View
                        onStartShouldSetResponderCapture={() => { if (mainTab !== 'daily') handleTabChange('daily'); return false; }}
                        style={[styles.column, mainTab === 'daily' && styles.activeColumn]}
                      >
                        <View style={styles.columnHeader}>
                          <Text style={styles.columnTitle}>
                            {settings?.language === 'ru' ? '⚡ Ежедневные' : '⚡ Daily Tasks'}
                          </Text>
                        </View>
                        <View style={styles.columnContent}>
                          {mainTab === 'daily' && activeView === 'recycle' ? (
                            <RecycleTab
                              context="daily"
                              rpgSubtab={rpgSubtab}
                              todoList={todoList}
                              deleteTodo={deleteTodo}
                              leftAction={handleLeftAction}
                              setTodoList={setTodoList}
                            />
                          ) : (
                            TAB_VIEWS.daily.list(tabProps)
                          )}
                        </View>
                      </View>
                    </View>
                  ) : (
                    TAB_VIEWS[mainTab]?.list ? (
                      TAB_VIEWS[mainTab].list(tabProps)
                    ) : null
                  )
                )}
              </View>
              <TabBar
                currentTab={mainTab}
                setCurrentTab={handleTabChange}
                rpgSubtab={rpgSubtab}
                activeView={activeView}
              />
              <Toast topOffset={120} />
            </SafeAreaView>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </LanguageProvider>
    </ThemeContext.Provider>
  );
}