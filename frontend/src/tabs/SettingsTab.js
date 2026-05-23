import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { TextInput as PaperInput, PaperProvider, Surface } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { styles } from './SettingsTab.styles';
import { AuthStorage } from '../utils/storage';
import { socket } from '../utils/socket';
import { theme } from '../theme/theme';

export const SettingsTab = ({ authMode, setAuthMode, authState, setAuthState }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (!authMode) {
      setAuthMode('local');
    }

    socket.on('server:auth_message', (data) => {
      if (data.status === 'success') {
        setUsername('');
        setPassword('');
      }

      Toast.show({
        type: data.status,
        text1: data.message,
        visibilityTime: 3000
      })
    })

    return () => socket.off('server:auth_message');
  }, []);

  const handleLogin = () => {
    if (username && password) {
      Keyboard.dismiss()
      socket.emit('client:login', { username, password });
    }
  };

  const handleRegister = () => {
    if (username && password) {
      Keyboard.dismiss()
      socket.emit('client:register', { username, password });
    }
  };

  const handleLogout = () => {
    AuthStorage.logout();
    setAuthMode('local');
    setAuthState('');
    setUsername('');
    setPassword('');
    socket.emit('client:logout');
  }

  return (
    <PaperProvider>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.containerColumn}>
          {authMode === 'local' && (
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                style={styles.authButton}
                onPress={() => {
                  setAuthState('login');
                  setAuthMode('');
                  setUsername('');
                  setPassword('');
                }}
              >
                <Text style={styles.authButtonText}>Войти</Text>
              </TouchableOpacity>
              <Text style={styles.baseText}>
                Нет аккаунта?{' '}
                <Text
                  style={styles.linkText}
                  onPress={() => {
                    setAuthState('register');
                    setAuthMode('');
                    setUsername('');
                    setPassword('');
                  }}>
                  Зарегистрироваться
                </Text>
              </Text>
            </View>
          )}
          {authMode === 'auth' && (
            <TouchableOpacity onPress={handleLogout} style={styles.authButton}>
              <Text style={styles.authButtonText}>Выйти</Text>
            </TouchableOpacity>
          )}
          {authState != '' && (
            <View style={{ alignItems: 'center', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
              <Surface style={styles.surfaceAuth}>
                <PaperInput
                  placeholder='Логин'
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
              </Surface>
              <Surface style={styles.surfaceAuth}>
                <PaperInput
                  placeholder='Пароль'
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
                      icon={isPasswordVisible ? "eye" : "eye-off"}
                      onPress={() => setPasswordVisible(!isPasswordVisible)}
                      color={theme.colors.icon.primary}
                    />
                  }
                  secureTextEntry={!isPasswordVisible}
                  style={styles.authInput}
                  placeholderTextColor={theme.colors.text.muted}
                />
              </Surface>
            </View>
          )}
          {authState === 'login' && (
            <TouchableOpacity onPress={handleLogin} style={styles.authButton}>
              <Text style={styles.authButtonText}>Войти</Text>
            </TouchableOpacity>
          )}
          {authState === 'register' && (
            <TouchableOpacity onPress={handleRegister} style={styles.authButton}>
              <Text style={styles.authButtonText}>Зарегистрироваться</Text>
            </TouchableOpacity>
          )}
          <Toast />
        </View>
      </TouchableWithoutFeedback>
    </PaperProvider>
  );
};
