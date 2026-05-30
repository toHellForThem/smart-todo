import { StyleSheet } from 'react-native';

export const getStyles = (theme) => StyleSheet.create({
  todoWrapper: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    borderBottomWidth: 1,
    borderColor: theme.colors.border.light,
    paddingHorizontal: theme.spacing.xl,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    fontSize: 16,
    color: theme.colors.text.primary,
    elevation: 2,
  },
  addButton: {
    backgroundColor: theme.colors.primaryLight,
    marginLeft: theme.spacing.smd,
    borderRadius: theme.radius.lg,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  addButtonText: {
    color: theme.colors.surface,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 3,
    textAlign: 'center',
  },
});
