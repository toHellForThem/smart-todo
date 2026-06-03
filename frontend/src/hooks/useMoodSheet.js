import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  withSpring,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

const MAX_PULL = 396;

export const useMoodSheet = (onStateChange) => {
  const translateY = useSharedValue(0);
  const context = useSharedValue(0);
  const isActive = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .minDistance(10)
    .onStart((event) => {
      context.value = translateY.value;
      if (onStateChange) runOnJS(onStateChange)(true);
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
        if (onStateChange) runOnJS(onStateChange)(true);
      } else if (swipeVelocity < -500 || event.translationY < -100) {
        translateY.value = withSpring(0);
        isActive.value = 0;
        if (onStateChange) runOnJS(onStateChange)(false);
      } else {
        if (translateY.value > MAX_PULL / 2) {
          translateY.value = withSpring(MAX_PULL);
          isActive.value = 1;
          if (onStateChange) runOnJS(onStateChange)(true);
        } else {
          translateY.value = withSpring(0);
          isActive.value = 0;
          if (onStateChange) runOnJS(onStateChange)(false);
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

  const tailProps = useAnimatedProps(() => ({
    pointerEvents: translateY.value > 20 ? 'auto' : 'none',
  }));

  const closeSheet = () => {
    translateY.value = withSpring(0);
    isActive.value = 0;
    if (onStateChange) onStateChange(false);
  };

  const openSheet = () => {
    translateY.value = withSpring(MAX_PULL);
    isActive.value = 1;
    if (onStateChange) onStateChange(true);
  };

  const toggleSheet = () => {
    if (isActive.value === 1) {
      closeSheet();
    } else {
      openSheet();
    }
  };

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      runOnJS(toggleSheet)();
    });

  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  return {
    panGesture: composedGesture,
    animatedStyle,
    tailStyle,
    tailProps,
    contentAnimatedStyle,
    animatedContentProps,
    closeSheet,
    openSheet,
    toggleSheet,
    isActive,
  };
};
