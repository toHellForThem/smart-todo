import { StyleSheet } from 'react-native';

export const getStyles = (theme) => StyleSheet.create({
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.surface,
    zIndex: -1,
    marginRight: 50,
  },
  backgroundBar: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  fill: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primaryLight,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  segment: {
    flex: 1,
    height: 18,
    borderRightWidth: 1,
    borderRightColor: 'rgba(59, 130, 246, 0.4)',
  },
});
