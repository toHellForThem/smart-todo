import { StyleSheet } from 'react-native';
import { theme } from './src/theme/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    zIndex: 51,
  },
  main: {
    flex: 1,
  },
});
