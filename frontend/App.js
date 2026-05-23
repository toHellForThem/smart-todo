import { useState } from 'react';
import {
  View,
  Platform,
  UIManager
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { renderLeftAction } from './src/utils/swipe';

import { styles } from './styles';
import { TodoTab } from './src/tabs/TodoTab';
import { RecycleTab } from './src/tabs/RecycleTab';
import { DailyTab } from './src/tabs/DailyTab';
import { SettingsTab } from './src/tabs/SettingsTab';
import { TabBar } from './src/components/TabBar';
import { Header } from './src/components/Header';

import { useTodoActions } from './src/hooks/useTodoActions';
import { useTodoSocket } from './src/hooks/useTodoSocket';
import { useMoodSheet } from './src/hooks/useMoodSheet';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const moods = [
  { value: 1, icon: 'emoticon-dead-outline', color: '#4B4B4B' },
  { value: 2, icon: 'emoticon-sad-outline', color: '#FF5252' },
  { value: 3, icon: 'emoticon-neutral-outline', color: '#FFC107' },
  { value: 4, icon: 'emoticon-happy-outline', color: '#8BC34A' },
  { value: 5, icon: 'emoticon-excited-outline', color: '#4CAF50' },
];

const TAB_VIEWS = {
  todo: {
    list: (props) => (
      <TodoTab
        task={props.task}
        setTask={props.setTask}
        onAdd={props.onAdd}
        todoList={props.todoList}
        statusChangeTask={props.statusChangeTask}
        deleteTodo={props.deleteToRecycle}
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
        deleteTodo={props.deleteToRecycle}
        leftAction={props.leftAction}
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
    />
  ),
  recycle: (props) => (
    <RecycleTab
      context={props.mainTab}
      todoList={props.todoList}
      deleteTodo={props.deleteTodo}
      leftAction={props.leftAction}
      setTodoList={props.setTodoList}
    />
  ),
};

export default function App() {
  const [task, setTask] = useState('');
  const [mainTab, setMainTab] = useState('todo');
  const [activeView, setActiveView] = useState('list');
  const [authMode, setAuthMode] = useState('local');
  const [authState, setAuthState] = useState('');

  const {
    todoList,
    setTodoList,
    addTask,
    deleteToRecycle,
    statusChangeTask,
    deleteTodo,
  } = useTodoActions(mainTab);

  useTodoSocket(setTodoList, setAuthMode, setAuthState);

  const moodSheet = useMoodSheet();

  return (
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
          />
          <View style={styles.main}>
            {GLOBAL_VIEWS[activeView] ? (
              GLOBAL_VIEWS[activeView]({
                mainTab,
                todoList,
                deleteTodo,
                leftAction: renderLeftAction,
                setTodoList,
                authMode,
                setAuthMode,
                authState,
                setAuthState,
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
                  deleteToRecycle,
                  leftAction: renderLeftAction,
                })
              ) : null
            )}
          </View>
          <TabBar
            currentTab={mainTab}
            setCurrentTab={(tab) => {
              setMainTab(tab);
              setActiveView('list');
            }}
          />
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}