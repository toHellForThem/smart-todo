import { StyleSheet } from 'react-native';

export const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    zIndex: 51,
  },
  main: {
    flex: 1,
  },
  mainWide: {
    flexDirection: 'row',
  },
  dashboardContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
  },
  column: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  activeColumn: {
    borderColor: theme.colors.primary,
    elevation: 4,
    shadowOpacity: 0.1,
  },
  columnHeader: {
    height: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    backgroundColor: theme.colors.background,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  columnContent: {
    flex: 1,
  },
});
