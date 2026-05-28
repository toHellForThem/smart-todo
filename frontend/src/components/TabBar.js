import { memo, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import { styles } from './TabBar.styles';
import { theme } from '../theme/theme';

export const TabBar = memo(({ currentTab, setCurrentTab, rpgSubtab, activeView }) => {
  const isRpgActive = currentTab === 'rpg';
  const isTodoActive = currentTab === 'todo';
  const isDailyActive = currentTab === 'daily';

  // The active tab should pulse if inside subtabs, recycle bin, or settings
  const shouldBlink = (isRpgActive && rpgSubtab !== 'dashboard') || activeView === 'recycle' || activeView === 'settings';

  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (shouldBlink) {
      // Start looping breathing fade animation using standard React Native Animated loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.1,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Return and stabilize at solid 100% opacity
      blinkAnim.setValue(1);
    }
  }, [shouldBlink]);

  const renderActiveIndicator = (isActive) => {
    if (!isActive) return null;
    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: theme.colors.primary,
          opacity: shouldBlink ? blinkAnim : 1,
        }}
      />
    );
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[
          styles.tab,
          isRpgActive && styles.activeTab,
          isRpgActive && { borderTopWidth: 0 } // Let absolute indicator handle top border cleanly
        ]}
        onPress={() => setCurrentTab('rpg')}
      >
        {renderActiveIndicator(isRpgActive)}
        <Text style={styles.tabText}>RPG</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          isTodoActive && styles.activeTab,
          isTodoActive && { borderTopWidth: 0 }
        ]}
        onPress={() => setCurrentTab('todo')}
      >
        {renderActiveIndicator(isTodoActive)}
        <Text style={styles.tabText}>To Do</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          isDailyActive && styles.activeTab,
          isDailyActive && { borderTopWidth: 0 }
        ]}
        onPress={() => setCurrentTab('daily')}
      >
        {renderActiveIndicator(isDailyActive)}
        <Text style={styles.tabText}>Daily</Text>
      </TouchableOpacity>
    </View>
  );
});
