import { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { GestureDetector } from 'react-native-gesture-handler';
import ReAnimated from 'react-native-reanimated';
import { styles } from '../../styles';

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
          style={{ padding: 2, marginRight: 5, borderRadius: 10, backgroundColor: '#d9e7fd' }}
          name={'clock-edit-outline'}
          size={45}
          color={'#3B82F6'}
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
                color={'#3b83f6'}
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
            backgroundColor: activeView === 'recycle' ? '#3B82F6' : '#d9e7fd'
          }}
          name={'trash-outline'}
          size={45}
          color={activeView === 'recycle' ? '#FFFFFF' : '#3B82F6'}
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
            backgroundColor: activeView === 'settings' ? '#3B82F6' : '#d9e7fd'
          }}
          name={'settings-outline'}
          size={45}
          color={activeView === 'settings' ? '#FFFFFF' : '#3B82F6'}
        />
      </TouchableOpacity>
    </View>
  );
});
