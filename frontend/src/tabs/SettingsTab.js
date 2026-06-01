import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Switch,
  ScrollView,
  Linking,
  Image
} from 'react-native';
import { TextInput as PaperInput, PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { getStyles } from './SettingsTab.styles';
import { AuthStorage, TodoStorage, RpgStorage } from '../utils/storage';
import { socket, updateSocketUrlAndReconnect } from '../utils/socket';
import { useAppTheme, useStyles } from '../theme/ThemeContext';

export const SettingsTab = ({
  authMode,
  setAuthMode,
  authState,
  setAuthState,
  settings,
  setSettings,
  setTodoList,
  setRpgHistory,
  setMainTab
}) => {
  const styles = useStyles(getStyles);
  const { theme } = useAppTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(() => AuthStorage.getServerUrl() || '');

  const handleSaveServerUrl = () => {
    Keyboard.dismiss();
    const url = serverUrlInput.trim();
    if (!url) {
      Toast.show({
        type: 'error',
        text1: 'Пожалуйста, введите корректный URL',
        visibilityTime: 3000
      });
      return;
    }

    // Add http:// if protocol is missing
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'http://' + formattedUrl;
    }

    updateSocketUrlAndReconnect(formattedUrl);
    setServerUrlInput(formattedUrl);

    Toast.show({
      type: 'success',
      text1: 'Адрес сервера сохранен!',
      text2: 'Переподключение к ' + formattedUrl,
      visibilityTime: 3000
    });
  };

  const handleResetServerUrl = () => {
    Keyboard.dismiss();
    updateSocketUrlAndReconnect('');
    setServerUrlInput('');

    Toast.show({
      type: 'success',
      text1: 'Адрес сброшен по умолчанию!',
      text2: 'Переподключение к ' + (process.env.EXPO_PUBLIC_SOCKET_URL || ''),
      visibilityTime: 3000
    });
  };

  const handleDonate = () => {
    Linking.openURL('https://www.donationalerts.com/r/tohellforthem').catch(err => {
      Toast.show({
        type: 'error',
        text1: 'Не удалось открыть ссылку',
        visibilityTime: 2500
      });
    });
  };

  useEffect(() => {
    if (!authMode) {
      setAuthMode('local');
    }

    const handleAuthMessage = (data) => {
      if (data.status === 'success') {
        setUsername('');
        setPassword('');
      }

      Toast.show({
        type: data.status,
        text1: data.message,
        visibilityTime: 3000
      });
    };

    socket.on('server:auth_message', handleAuthMessage);
    return () => {
      socket.off('server:auth_message', handleAuthMessage);
    };
  }, [authMode, setAuthMode]);

  const handleLogin = () => {
    if (username && password) {
      Keyboard.dismiss();
      socket.emit('client:login', { username, password });
    }
  };

  const handleRegister = () => {
    if (username && password) {
      Keyboard.dismiss();
      socket.emit('client:register', { username, password });
    }
  };

  const handleLogout = () => {
    AuthStorage.logout();
    socket.auth = {};
    setAuthMode('local');
    setAuthState('');
    setUsername('');
    setPassword('');
    socket.emit('client:logout');

    if (setTodoList) {
      setTodoList([]);
      TodoStorage.saveAll([]);
    }
    if (setRpgHistory) {
      setRpgHistory([]);
      RpgStorage.saveHistory([]);
    }

    // Reset to defaults on logout
    const defaults = { main_page: 'todo', theme: 'default', soft_delete: true, reset_time: '00:00', reset_enabled: true };
    setSettings(defaults);
  };

  // Helper to handle settings updates
  const updateSetting = (key, value) => {
    const updated = { ...settings, [key]: value, updatedAt: Date.now() };
    setSettings(updated);
    AuthStorage.setSettings(updated);
    if (authMode === 'auth') {
      socket.emit('client:update_settings', updated);
    }
    if (key === 'main_page' && setMainTab) {
      setMainTab(value);
    }
  };

  const handleThemeChange = (newTheme) => {
    updateSetting('theme', newTheme);
    Toast.show({
      type: 'success',
      text1: 'Тема успешно изменена',
      visibilityTime: 2000
    });
  };

  // Parsing current reset time
  const resetTimeStr = settings?.reset_time || '00:00';
  const [hStr, mStr] = resetTimeStr.split(':');
  const hours = parseInt(hStr, 10) || 0;
  const minutes = parseInt(mStr, 10) || 0;

  const changeHours = (delta) => {
    const newHours = (hours + delta + 24) % 24;
    updateSetting('reset_time', `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
  };

  const changeMinutes = (delta) => {
    const newMinutes = (minutes + delta + 60) % 60;
    updateSetting('reset_time', `${hours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`);
  };

  const activeRpgSubtab = (settings?.rpg_subtab === 'habits' || settings?.rpg_subtab === 'piggy_bank' || settings?.rpg_subtab === 'tv_shows')
    ? settings.rpg_subtab
    : 'habits';

  return (
    <PaperProvider>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView
          contentContainerStyle={authState !== '' ? [styles.scrollContainer, { flexGrow: 1, justifyContent: 'center' }] : styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Account Section */}
          {authState === '' && (
            <View style={styles.card}>
              {authMode === 'auth' ? (
                <View style={styles.profileRow}>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileTitle}>Личный кабинет</Text>
                    <Text style={styles.profileUsername}>{AuthStorage.getUsername() || 'Пользователь'}</Text>
                    <View style={styles.syncBadge}>
                      <View style={styles.pulseDot} />
                      <Text style={styles.syncText}>Облако активно</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <MaterialCommunityIcons name="logout" size={18} color={theme.colors.icon.primary} />
                    <Text style={styles.logoutButtonText}>Выйти</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.localProfileContainer}>
                  <View style={styles.localProfileHeader}>
                    <MaterialCommunityIcons name="cloud-off-outline" size={24} color={theme.colors.text.secondary} />
                    <Text style={styles.cardTitle}>Локальный профиль</Text>
                  </View>
                  <View style={styles.authButtonsRow}>
                    <TouchableOpacity
                      style={styles.primaryAuthButton}
                      onPress={() => {
                        setAuthState('login');
                        setUsername('');
                        setPassword('');
                      }}
                    >
                      <Text style={styles.primaryAuthButtonText}>Войти</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.secondaryAuthButton}
                      onPress={() => {
                        setAuthState('register');
                        setUsername('');
                        setPassword('');
                      }}
                    >
                      <Text style={styles.secondaryAuthButtonText}>Регистрация</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* 1.5 Server Configuration Section */}
          {authState === '' && (
            <View style={styles.card}>
              <View style={styles.cardHeaderWithIcon}>
                <MaterialCommunityIcons name="server" size={20} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Подключение к серверу (API)</Text>
              </View>

              <View style={{ marginTop: 12 }}>
                <PaperInput
                  placeholder=" http://192.168.1.50:8000"
                  value={serverUrlInput}
                  onChangeText={setServerUrlInput}
                  mode="outlined"
                  outlineColor={theme.colors.border.light}
                  textColor={theme.colors.text.primary}
                  theme={{
                    roundness: theme.radius.lg,
                    colors: {
                      primary: theme.colors.icon.primary,
                    },
                  }}
                  placeholderTextColor={theme.colors.text.muted}
                  style={styles.authInput}
                />

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <TouchableOpacity
                    style={[styles.primaryAuthButton, { flex: 1, height: 40, paddingVertical: 0, justifyContent: 'center' }]}
                    onPress={handleSaveServerUrl}
                  >
                    <Text style={styles.primaryAuthButtonText}>Сохранить</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.secondaryAuthButton, { flex: 1, height: 40, paddingVertical: 0, justifyContent: 'center' }]}
                    onPress={handleResetServerUrl}
                  >
                    <Text style={styles.secondaryAuthButtonText}>Сбросить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Authorization Forms */}
          {authState !== '' && (
            <View style={[styles.card, styles.authCard]}>
              <TouchableOpacity
                onPress={() => setAuthState('')}
                style={styles.cornerBackButton}
                activeOpacity={0.6}
              >
                <Ionicons name="arrow-back" size={26} color={theme.colors.icon.primary} />
              </TouchableOpacity>

              <Text style={styles.authTitle}>
                {authState === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
              </Text>

              <View style={styles.formContainer}>
                <PaperInput
                  placeholder=" Логин"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.authInput}
                  mode="outlined"
                  outlineColor={theme.colors.border.light}
                  textColor={theme.colors.text.primary}
                  theme={{
                    roundness: theme.radius.lg,
                    colors: {
                      primary: theme.colors.icon.primary,
                    },
                  }}
                  left={<PaperInput.Icon icon="account" color={theme.colors.icon.primary} />}
                  placeholderTextColor={theme.colors.text.muted}
                />

                <PaperInput
                  placeholder=" Пароль"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  outlineColor={theme.colors.border.light}
                  textColor={theme.colors.text.primary}
                  theme={{
                    roundness: theme.radius.lg,
                    colors: {
                      primary: theme.colors.icon.primary,
                    },
                  }}
                  left={
                    <PaperInput.Icon
                      icon="lock-outline"
                      color={theme.colors.icon.primary}
                    />
                  }
                  right={
                    <PaperInput.Icon
                      icon={isPasswordVisible ? 'eye' : 'eye-off'}
                      onPress={() => setPasswordVisible(!isPasswordVisible)}
                      color={theme.colors.icon.primary}
                    />
                  }
                  secureTextEntry={!isPasswordVisible}
                  style={styles.authInput}
                  placeholderTextColor={theme.colors.text.muted}
                />

                <TouchableOpacity
                  onPress={authState === 'login' ? handleLogin : handleRegister}
                  style={styles.submitAuthButton}
                >
                  <Text style={styles.submitAuthButtonText}>
                    {authState === 'login' ? 'Войти' : 'Создать аккаунт'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setAuthState(authState === 'login' ? 'register' : 'login')}
                  style={styles.toggleAuthLink}
                >
                  <Text style={styles.toggleAuthText}>
                    {authState === 'login'
                      ? 'Нет аккаунта? Зарегистрироваться'
                      : 'Уже есть аккаунт? Войти'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 2. Reset Time Selector */}
          {authState === '' && (
            <View style={styles.card}>
              <View style={styles.cardHeaderWithIcon}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Время сброса дейли и привычек</Text>
              </View>

              <View style={styles.clockCenterContainer}>
                <View style={styles.compactClock}>
                  {/* Hours Block */}
                  <View style={styles.compactClockGroup}>
                    <TouchableOpacity
                      onPress={() => changeHours(-1)}
                      style={[styles.clockControlBtn, styles.clockControlBtnLeft]}
                      activeOpacity={0.6}
                    >
                      <Ionicons name="remove" size={22} color={theme.colors.icon.primary} />
                    </TouchableOpacity>
                    <View style={styles.clockValueBg}>
                      <Text style={styles.clockValueLabel}>Часы</Text>
                      <Text style={styles.clockValueText}>
                        {hours.toString().padStart(2, '0')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => changeHours(1)}
                      style={[styles.clockControlBtn, styles.clockControlBtnRight]}
                      activeOpacity={0.6}
                    >
                      <Ionicons name="add" size={22} color={theme.colors.icon.primary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.compactSeparator}>:</Text>

                  {/* Minutes Block */}
                  <View style={styles.compactClockGroup}>
                    <TouchableOpacity
                      onPress={() => changeMinutes(-5)}
                      style={[styles.clockControlBtn, styles.clockControlBtnLeft]}
                      activeOpacity={0.6}
                    >
                      <Ionicons name="remove" size={22} color={theme.colors.icon.primary} />
                    </TouchableOpacity>
                    <View style={styles.clockValueBg}>
                      <Text style={styles.clockValueLabel}>Минуты</Text>
                      <Text style={styles.clockValueText}>
                        {minutes.toString().padStart(2, '0')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => changeMinutes(5)}
                      style={[styles.clockControlBtn, styles.clockControlBtnRight]}
                      activeOpacity={0.6}
                    >
                      <Ionicons name="add" size={22} color={theme.colors.icon.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* 3. Startup Screen Section */}
          {authState === '' && (
            <View style={styles.card}>
              <View style={styles.cardHeaderWithIcon}>
                <MaterialCommunityIcons name="home-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Стартовый экран</Text>
              </View>

              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    settings?.main_page === 'rpg' && styles.segmentButtonActive
                  ]}
                  onPress={() => updateSetting('main_page', 'rpg')}
                >
                  <MaterialCommunityIcons
                    name="sword-cross"
                    size={16}
                    color={settings?.main_page === 'rpg' ? theme.colors.icon.primary : theme.colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      settings?.main_page === 'rpg' && styles.segmentTextActive
                    ]}
                  >
                    RPG
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    settings?.main_page === 'todo' && styles.segmentButtonActive
                  ]}
                  onPress={() => updateSetting('main_page', 'todo')}
                >
                  <MaterialCommunityIcons
                    name="checkbox-marked-circle-outline"
                    size={16}
                    color={settings?.main_page === 'todo' ? theme.colors.icon.primary : theme.colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      settings?.main_page === 'todo' && styles.segmentTextActive
                    ]}
                  >
                    To Do
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    settings?.main_page === 'daily' && styles.segmentButtonActive
                  ]}
                  onPress={() => updateSetting('main_page', 'daily')}
                >
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={16}
                    color={settings?.main_page === 'daily' ? theme.colors.icon.primary : theme.colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      settings?.main_page === 'daily' && styles.segmentTextActive
                    ]}
                  >
                    Daily
                  </Text>
                </TouchableOpacity>
              </View>

              {/* RPG Subtabs Selection */}
              {settings?.main_page === 'rpg' && (
                <View style={styles.subtabContainer}>
                  <View style={[styles.cardHeaderWithIcon, { marginTop: 10, marginBottom: 6 }]}>
                    <MaterialCommunityIcons name="layers-outline" size={16} color={theme.colors.primary} />
                    <Text style={[styles.cardTitle, { fontSize: 13, color: theme.colors.text.secondary }]}>
                      RPG
                    </Text>
                  </View>

                  <View style={styles.segmentedControl}>
                    <TouchableOpacity
                      style={[
                        styles.segmentButton,
                        activeRpgSubtab === 'habits' && styles.segmentButtonActive
                      ]}
                      onPress={() => updateSetting('rpg_subtab', 'habits')}
                    >
                      <MaterialCommunityIcons
                        name="star-circle-outline"
                        size={14}
                        color={activeRpgSubtab === 'habits' ? theme.colors.icon.primary : theme.colors.text.secondary}
                      />
                      <Text
                        style={[
                          styles.segmentText,
                          activeRpgSubtab === 'habits' && styles.segmentTextActive,
                          { fontSize: 11 }
                        ]}
                      >
                        Привычки
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.segmentButton,
                        activeRpgSubtab === 'piggy_bank' && styles.segmentButtonActive
                      ]}
                      onPress={() => updateSetting('rpg_subtab', 'piggy_bank')}
                    >
                      <MaterialCommunityIcons
                        name="piggy-bank-outline"
                        size={14}
                        color={activeRpgSubtab === 'piggy_bank' ? theme.colors.icon.primary : theme.colors.text.secondary}
                      />
                      <Text
                        style={[
                          styles.segmentText,
                          activeRpgSubtab === 'piggy_bank' && styles.segmentTextActive,
                          { fontSize: 11 }
                        ]}
                      >
                        Копилка
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.segmentButton,
                        activeRpgSubtab === 'tv_shows' && styles.segmentButtonActive
                      ]}
                      onPress={() => updateSetting('rpg_subtab', 'tv_shows')}
                    >
                      <MaterialCommunityIcons
                        name="television-play"
                        size={14}
                        color={activeRpgSubtab === 'tv_shows' ? theme.colors.icon.primary : theme.colors.text.secondary}
                      />
                      <Text
                        style={[
                          styles.segmentText,
                          activeRpgSubtab === 'tv_shows' && styles.segmentTextActive,
                          { fontSize: 11 }
                        ]}
                      >
                        Сериалы
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* 3.5 Theme Selector Section */}
          {authState === '' && (
            <View style={styles.card}>
              <View style={styles.cardHeaderWithIcon}>
                <MaterialCommunityIcons name="palette-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Выбор темы оформления</Text>
              </View>

              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    settings?.theme !== 'dark' && settings?.theme !== 'mint' && styles.segmentButtonActive
                  ]}
                  onPress={() => handleThemeChange('default')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      settings?.theme !== 'dark' && settings?.theme !== 'mint' && styles.segmentTextActive
                    ]}
                  >
                    Голубая
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    settings?.theme === 'mint' && styles.segmentButtonActive
                  ]}
                  onPress={() => handleThemeChange('mint')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      settings?.theme === 'mint' && settings?.theme !== 'dark' && styles.segmentTextActive
                    ]}
                  >
                    Мятная
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    settings?.theme === 'dark' && styles.segmentButtonActive
                  ]}
                  onPress={() => handleThemeChange('dark')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      settings?.theme === 'dark' && styles.segmentTextActive
                    ]}
                  >
                    Темная
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 4. Soft Delete Toggle Section */}
          {authState === '' && (
            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <View style={styles.cardHeaderWithIcon}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.cardTitle}>Удаление в корзину</Text>
                  </View>
                </View>
                <Switch
                  value={settings?.soft_delete !== false}
                  onValueChange={(val) => updateSetting('soft_delete', val)}
                  trackColor={{ false: theme.colors.border.light, true: theme.colors.primaryLight }}
                  thumbColor={settings?.soft_delete !== false ? theme.colors.primary : theme.colors.border.default}
                />
              </View>
            </View>
          )}

          {/* 5. Reset Enabled Toggle Section */}
          {authState === '' && (
            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <View style={styles.cardHeaderWithIcon}>
                    <MaterialCommunityIcons name="history" size={20} color={theme.colors.primary} />
                    <Text style={styles.cardTitle}>Сброс дейли и привычек</Text>
                  </View>
                </View>
                <Switch
                  value={settings?.reset_enabled !== false}
                  onValueChange={(val) => updateSetting('reset_enabled', val)}
                  trackColor={{ false: theme.colors.border.light, true: theme.colors.primaryLight }}
                  thumbColor={settings?.reset_enabled !== false ? theme.colors.primary : theme.colors.border.default}
                />
              </View>
            </View>
          )}

          {/* 6. About Section */}
          {authState === '' && (
            <View style={styles.card}>
              <View style={styles.cardHeaderWithIcon}>
                <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>О программе</Text>
              </View>

              <View style={{ marginTop: 12, alignItems: 'center' }}>
                <Image
                  source={require('../../assets/icon.png')}
                  style={{ width: 64, height: 64, borderRadius: 14, marginBottom: 8 }}
                />

                <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.text.primary }}>
                  To Do So Do
                </Text>

                <Text style={{ fontSize: 12, color: theme.colors.text.muted, marginTop: 2, fontWeight: '600' }}>
                  Версия 1.0.0
                </Text>

                <Text style={{ fontSize: 13, color: theme.colors.text.secondary, textAlign: 'center', marginTop: 10, lineHeight: 18, paddingHorizontal: 10 }}>
                  Умный таск-трекер с элементами RPG. Выполняйте дейлики, прокачивайте полезные привычки, копите на мечты в копилке и ведите учет любимых сериалов в одном месте!
                </Text>

                <TouchableOpacity
                  onPress={handleDonate}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F59E0B', // Premium Warm Amber/Gold color
                    borderRadius: theme.radius.md,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    marginTop: 14,
                    width: '100%',
                    elevation: 1,
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="heart-pulse" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Поддержать автора
                  </Text>
                </TouchableOpacity>

                <View style={{ width: '100%', height: 1, backgroundColor: theme.colors.border.light, marginVertical: 14 }} />

                <Text style={{ fontSize: 11, color: theme.colors.text.muted, fontWeight: '500' }}>
                  Copyright © 2026 toHellForThem. All rights reserved.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
        <Toast />
      </View>
    </PaperProvider>
  );
};
