import { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { GestureDetector } from 'react-native-gesture-handler';
import ReAnimated from 'react-native-reanimated';
import { styles } from './Header.styles';
import { theme } from '../theme/theme';

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
  authMode
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity>
        <MaterialCommunityIcons
          style={{ padding: 2, marginRight: 5, borderRadius: 10, backgroundColor: theme.colors.icon.bg }}
          name={'clock-edit-outline'}
          size={45}
          color={theme.colors.icon.primary}
        />
      </TouchableOpacity>

      <GestureDetector gesture={panGesture}>
        <View style={styles.scoreContainer}>
          <Text style={{ fontSize: 20 }}>Как твои делишки?</Text>
          <ReAnimated.View style={[styles.contentPlaceholder, animatedContentProps]}>
            <ReAnimated.View style={[styles.moodMeter, contentAnimatedStyle]}>
              {moods.map((mood) => (
                <TouchableOpacity key={mood.value} onPress={() => console.log(mood.value)}>
                  <MaterialCommunityIcons name={mood.icon} size={50} color={mood.color} />
                </TouchableOpacity>
              ))}
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
