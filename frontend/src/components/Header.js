import { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { GestureDetector } from 'react-native-gesture-handler';
import ReAnimated from 'react-native-reanimated';
import { getStyles } from './Header.styles';
import { useAppTheme, useStyles } from '../theme/ThemeContext';
import { getLogicalDateStr } from '../utils/date';
import { useTranslation } from '../utils/LanguageContext';

export const Header = memo(({
  panGesture,
  animatedContentProps,
  contentAnimatedStyle,
  moods,
  tailStyle,
  animatedStyle,
  activeView,
  setActiveView,
  setAuthState,
  setAuthMode,
  authMode,
  onMoodChange,
  onOpenCalendar,
  rpgHistory,
  settings,
}) => {
  const styles = useStyles(getStyles);
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const todayStr = getLogicalDateStr(settings?.reset_time);
  const todayEntry = rpgHistory?.find(item => item.date === todayStr);
  const currentMoodValue = todayEntry ? todayEntry.mood : null;

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => {
          if (authMode === 'auth') {
            Toast.show({
              type: 'success',
              text1: t('hdr_cloud_active'),
              text2: t('hdr_cloud_desc'),
              visibilityTime: 2500,
            });
          } else {
            Toast.show({
              type: 'info',
              text1: t('hdr_local_mode'),
              text2: t('hdr_local_desc'),
              visibilityTime: 2500,
            });
          }
        }}
        style={{ zIndex: 1 }}
      >
        <MaterialCommunityIcons
          style={{ padding: 2, marginRight: 5, borderRadius: 10, backgroundColor: theme.colors.icon.bg }}
          name={authMode === 'auth' ? 'cloud' : 'cloud-off-outline'}
          size={45}
          color={authMode === 'auth' ? theme.colors.primary : theme.colors.text.muted}
        />
      </TouchableOpacity>

      <GestureDetector gesture={panGesture}>
        <View style={styles.scoreContainer} onPress={() => { }}>
          <Text style={{ fontSize: 20, color: theme.colors.text.primary }}>{t('hdr_how_are_things')}</Text>
          <ReAnimated.View style={[styles.contentPlaceholder, animatedContentProps]}>
            <ReAnimated.View style={[styles.moodMeter, contentAnimatedStyle]}>
              {moods.map((mood) => {
                const isSelected = currentMoodValue === mood.value;
                const isAnySelected = currentMoodValue !== null && currentMoodValue !== undefined;
                const opacity = isSelected ? 1.0 : (isAnySelected ? 0.35 : 0.65);

                return (
                  <TouchableOpacity
                    key={mood.value}
                    onPress={() => onMoodChange && onMoodChange(mood.value)}
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: opacity,
                      transform: [{ scale: isSelected ? 1.3 : 1.0 }],
                    }}
                  >
                    <MaterialCommunityIcons name={mood.icon} size={50} color={mood.color} />
                  </TouchableOpacity>
                );
              })}
            </ReAnimated.View>
          </ReAnimated.View>
          <ReAnimated.View style={[styles.invisibleShade, tailStyle]} />
          <ReAnimated.View style={[styles.scoreShade, animatedStyle, { cursor: 'grab' }]}>
            <View>
              <Ionicons
                name={'caret-down'}
                size={20}
                color={theme.colors.icon.primary}
              />
            </View>
          </ReAnimated.View>
        </View>
      </GestureDetector>

      <TouchableOpacity
        onPress={() => setActiveView(prev => prev === 'recycle' ? 'list' : 'recycle')}
        style={{ zIndex: 1 }}
      >
        <Ionicons
          style={{
            padding: 2,
            marginRight: 5,
            borderRadius: 10,
            backgroundColor: activeView === 'recycle' ? theme.colors.icon.bgActive : theme.colors.icon.bg
          }}
          name={'trash-outline'}
          size={45}
          color={activeView === 'recycle' ? theme.colors.icon.active : theme.colors.icon.primary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          if (activeView === 'settings') {
            setActiveView('list');
          } else {
            setActiveView('settings');
            setAuthState('');
            if (!authMode) {
              setAuthMode('local');
            }
          }
        }}
        style={{ zIndex: 1 }}
      >
        <Ionicons
          style={{
            padding: 2,
            borderRadius: 10,
            backgroundColor: activeView === 'settings' ? theme.colors.icon.bgActive : theme.colors.icon.bg
          }}
          name={'settings-outline'}
          size={45}
          color={activeView === 'settings' ? theme.colors.icon.active : theme.colors.icon.primary}
        />
      </TouchableOpacity>
    </View>
  );
});
