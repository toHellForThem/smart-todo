import { StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const styles = StyleSheet.create({
  containerColumn: { 
    flex: 1, 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  baseText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  linkText: {
    color: '#007AFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  authButton: {
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.smd,
    elevation: 2,
  },
  authButtonText: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  authInput: {
    backgroundColor: theme.colors.surface,
    fontSize: 16,
    color: '#1A202C',
    width: '100%',
  },
  surfaceAuth: {
    width: '75%',
    marginBottom: theme.spacing.smd,
    borderRadius: theme.radius.lg,
    backgroundColor: 'none',
  },
});
