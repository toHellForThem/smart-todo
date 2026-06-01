import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Platform,
  UIManager,
  BackHandler
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

import { useTodoActions } from './src/hooks/useTodoActions';
import { useTodoSocket } from './src/hooks/useTodoSocket';
import { useMoodSheet } from './src/hooks/useMoodSheet';
import { AuthStorage } from './src/utils/storage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TAB_VIEWS = {
  todo: {
    list: (props) => (
      <TodoTab
        task={props.task}
        setTask={props.setTask}
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
  const [task, setTask] = useState('');
  const [settings, setSettings] = useState(() => AuthStorage.getSettings());

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
  const [rpgSubtab, setRpgSubtab] = useState(() => {
    const localSettings = AuthStorage.getSettings();
    const savedSubtab = localSettings.rpg_subtab;
    if (savedSubtab === 'habits' || savedSubtab === 'piggy_bank' || savedSubtab === 'tv_shows') {
      return savedSubtab;
    }
    return 'habits';
  });
  const [isCalendarVisible, setCalendarVisible] = useState(false);

  const {
    todoList,
    setTodoList,
    addTask,
    deleteToRecycle,
    statusChangeTask,
    deleteTodo,

    // RPG State
    rpgHistory,
    setRpgHistory,

    // RPG Actions
    handleMoodChange,
  } = useTodoActions(mainTab, settings);

  const handleDeleteTodo = (id) => {
    if (settings.soft_delete) {
      deleteToRecycle(id);
    } else {
      deleteTodo(id);
    }
  };

  useTodoSocket(setTodoList, setAuthMode, setAuthState, setRpgHistory, setSettings, settings, setMainTab);

  const [isMoodSheetOpen, setIsMoodSheetOpen] = useState(false);
  const moodSheet = useMoodSheet(setIsMoodSheetOpen);

  // Handle Android physical back button navigation
  useEffect(() => {
    const backAction = () => {
      // 1. If mood sheet (шторка) is open, close it (highest priority global overlay)
      if (moodSheet.isActive && moodSheet.isActive.value === 1) {
        moodSheet.closeSheet();
        return true;
      }

      // 2. If calendar modal is open, close it
      if (isCalendarVisible) {
        setCalendarVisible(false);
        return true;
      }

      // 3. If we are in settings or recycle bin, go back to main list view
      if (activeView !== 'list') {
        setActiveView('list');
        return true;
      }

      // 4. If we are in RPG tab and in a subtab (habits, piggy_bank, tv_shows), go back to dashboard
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

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView style={styles.container}>
            <Header
              {...moodSheet}
              moods={moods}
              activeView={activeView}
              setActiveView={setActiveView}
              setAuthState={setAuthState}
              setAuthMode={setAuthMode}
              authMode={authMode}
              onMoodChange={handleMoodChange}
              rpgHistory={rpgHistory}
              onOpenCalendar={() => {
                setMainTab('rpg');
                setRpgSubtab('dashboard');
                setCalendarVisible(true);
                setActiveView('list');
              }}
              settings={settings}
            />
            <View style={styles.main} pointerEvents={isMoodSheetOpen ? 'none' : 'auto'}>
              {GLOBAL_VIEWS[activeView] ? (
                GLOBAL_VIEWS[activeView]({
                  mainTab,
                  rpgSubtab,
                  todoList,
                  deleteTodo,
                  leftAction: (prog, drag, mode) => renderLeftAction(prog, drag, mode, theme),
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
                TAB_VIEWS[mainTab]?.list ? (
                  TAB_VIEWS[mainTab].list({
                    task,
                    setTask,
                    onAdd: addTask,
                    todoList,
                    setTodoList,
                    statusChangeTask,
                    deleteToRecycle: handleDeleteTodo,
                    handleDeleteTodo,
                    leftAction: (prog, drag, mode) => renderLeftAction(prog, drag, mode, theme),
                    rpgHistory,
                    setRpgHistory,
                    addTask,
                    rpgSubtab,
                    setRpgSubtab,
                    isCalendarVisible,
                    setCalendarVisible,
                    settings,
                  })
                ) : null
              )}
            </View>
            <TabBar
              currentTab={mainTab}
              setCurrentTab={(tab) => {
                if (tab === 'rpg') {
                  setRpgSubtab('dashboard');
                }
                setMainTab(tab);
                setActiveView('list');
              }}
              rpgSubtab={rpgSubtab}
              activeView={activeView}
            />
            <Toast topOffset={120} />
          </SafeAreaView>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
}