import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Platform,
  UIManager,
  BackHandler,
  useWindowDimensions
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
import { AuthStorage } from './src/utils/storage';

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

    rpgHistory,
    setRpgHistory,

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

  const tabProps = {
    onAdd: addTask,
    todoList,
    setTodoList,
    statusChangeTask,
    deleteToRecycle: handleDeleteTodo,
    handleDeleteTodo,
    leftAction: (prog, drag, mode) => renderLeftAction(prog, drag, mode, theme, settings?.language || 'ru', settings?.soft_delete !== false),
    rpgHistory,
    setRpgHistory,
    addTask,
    rpgSubtab,
    setRpgSubtab,
    isCalendarVisible,
    setCalendarVisible,
    settings,
  };

  const handleTabChange = (tab) => {
    if (tab === 'rpg') {
      setRpgSubtab('dashboard');
    }
    setMainTab(tab);
    setActiveView('list');
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      <LanguageProvider language={settings?.language || 'ru'}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
              {Platform.OS === 'web' && (
                <style dangerouslySetInnerHTML={{ __html: `
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
                    leftAction: (prog, drag, mode) => renderLeftAction(prog, drag, mode, theme, settings?.language || 'ru', settings?.soft_delete !== false),
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
                          {TAB_VIEWS.rpg.list(tabProps)}
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
                          {TAB_VIEWS.todo.list(tabProps)}
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
                          {TAB_VIEWS.daily.list(tabProps)}
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