import { StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const styles = StyleSheet.create({
  footer: {
    height: theme.sizes.footerHeight,
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopColor: '#eee',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 2,
  },
  activeTab: {
    borderTopColor: theme.colors.primary,
    backgroundColor: '#f0f0f0',
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});
