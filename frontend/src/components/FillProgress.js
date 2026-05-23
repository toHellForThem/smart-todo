import { memo, useEffect, useRef, useMemo } from 'react';
import { View, Animated } from 'react-native';
import { styles } from './FillProgress.styles';

export const FillProgress = memo(({ progressNow, progressEnd }) => {
  const scaleX = useRef(new Animated.Value(0)).current;
  const segments = useMemo(() => Array.from({ length: progressEnd }), [progressEnd]);

  useEffect(() => {
    Animated.timing(scaleX, {
      toValue: progressNow / progressEnd,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [progressNow, progressEnd]);

  return (
    <View style={styles.backgroundContainer}>
      <Animated.View
        style={[
          styles.fill,
          {
            transform: [
              { translateX: -135 },
              {
                scaleX: scaleX.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                })
              },
              { translateX: 135 }
            ]
          }
        ]}
      />
      <View style={styles.grid}>
        {segments.map((_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              index === segments.length - 1 ? { height: '100%' } : {}
            ]}
          />
        ))}
      </View>
    </View>
  );
});
