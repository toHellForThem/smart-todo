import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  withSpring,
  interpolate
} from 'react-native-reanimated';

const MAX_PULL = 396;

export const useMoodSheet = () => {
  const translateY = useSharedValue(0);
  const context = useSharedValue(0);
  const isActive = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      let newValue = context.value + event.translationY;

      if (newValue < 0) newValue = 0;
      if (newValue > MAX_PULL) newValue = MAX_PULL;
      translateY.value = newValue;
    })
    .onEnd((event) => {
      const swipeVelocity = event.velocityY;
      if (swipeVelocity > 500 || event.translationY > MAX_PULL * 0.4) {
        translateY.value = withSpring(MAX_PULL);
        isActive.value = 1;
      } else if (swipeVelocity < -500 || event.translationY < -100) {
        translateY.value = withSpring(0);
        isActive.value = 0;
      } else {
        if (translateY.value > MAX_PULL / 2) {
          translateY.value = withSpring(MAX_PULL);
          isActive.value = 1;
        } else {
          translateY.value = withSpring(0);
          isActive.value = 0;
        }
      }
    })
    .hitSlop({ vertical: 17 });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const tailStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(isActive.value === 1 ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0)'),
    pointerEvents: isActive.value === 1 ? 'auto' : 'none',
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            translateY.value,
            [0, MAX_PULL],
            [-400, 0]
          ),
        },
      ],
    };
  });

  const contentPointerEvents = useDerivedValue(() => {
    return translateY.value > 20 ? 'auto' : 'none';
  });

  const animatedContentProps = useAnimatedProps(() => ({
    pointerEvents: contentPointerEvents.value,
  }));

  return {
    panGesture,
    animatedStyle,
    tailStyle,
    contentAnimatedStyle,
    animatedContentProps,
  };
};
