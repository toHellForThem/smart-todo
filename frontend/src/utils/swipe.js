import { View, Animated, Text } from 'react-native';
import { styles } from '../styles/item.styles';
import { theme } from '../theme/theme';

export const renderLeftAction = (prog, drag, mode) => {
  const isRecycle = mode === 'hardDelete';

  const opacity = drag.interpolate({
    inputRange: [0, 30, 77 - (isRecycle ? 2 : -6)],
    outputRange: [0, 0.4, 1],
    extrapolate: 'clamp',
  });

  const translateX = drag.interpolate({
    inputRange: [0, 65, 77 - (isRecycle ? 2 : -6)],
    outputRange: [-59 + (isRecycle ? 2 : -6), 6 + (isRecycle ? 2 : -6), 18],
    extrapolate: 'clamp',
  });

  return (
    <View style={{
      height: '100%',
      justifyContent: 'center',
      paddingTop: 8,
      paddingBottom: 2,
      width: 90
    }}>
      <Animated.View style={[
        styles.deleteBack,
        {
          opacity: opacity,
          marginRight: -130,
          transform: [{ translateX: translateX }],
          backgroundColor: isRecycle ? theme.colors.danger : theme.colors.primary,
        }
      ]}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {isRecycle ? 'Удалить' : 'В корзину'}
        </Text>
      </Animated.View>
    </View>
  );
};
