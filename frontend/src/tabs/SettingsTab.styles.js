import { StyleSheet, Platform } from 'react-native';

export const getStyles = (theme) => StyleSheet.create({
  scrollContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.smd,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1.5,
      },
      web: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
      }
    }),
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  
  clockCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  
  compactClock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactClockGroup: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 48,
  },
  clockValueBg: {
    backgroundColor: theme.colors.icon.bg,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderColor: theme.colors.icon.primary,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  clockValueLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  clockValueText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  clockControlBtn: {
    width: 44,
    backgroundColor: theme.colors.icon.bg,
    borderWidth: 2,
    borderColor: theme.colors.icon.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockControlBtnLeft: {
    borderTopLeftRadius: theme.radius.lg,
    borderBottomLeftRadius: theme.radius.lg,
  },
  clockControlBtnRight: {
    borderTopRightRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.lg,
  },
  compactSeparator: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.icon.primary,
    marginHorizontal: 12,
    alignSelf: 'center',
  },
  
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  profileTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileUsername: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginTop: 1,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: theme.spacing.sm,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.icon.bg,
    borderRadius: theme.radius.md,
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.sm,
  },
  logoutButtonText: {
    color: theme.colors.icon.primary,
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  
  localProfileContainer: {
    flexDirection: 'column',
  },
  localProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  authButtonsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  primaryAuthButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  primaryAuthButtonText: {
    color: theme.colors.text.white,
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryAuthButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.md,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAuthButtonText: {
    color: theme.colors.text.secondary,
    fontWeight: '700',
    fontSize: 13,
  },

  authCard: {
    position: 'relative',
    paddingTop: theme.spacing.sm,
    overflow: 'hidden',
  },
  cornerBackButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: 48,
    backgroundColor: theme.colors.icon.bg,
    borderTopLeftRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.lg,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 30,
  },
  formContainer: {
    flexDirection: 'column',
  },
  authInput: {
    backgroundColor: theme.colors.surface,
    fontSize: 14,
    height: 48,
    marginBottom: 14,
  },
  submitAuthButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitAuthButtonText: {
    color: theme.colors.text.white,
    fontWeight: '700',
    fontSize: 14,
  },
  toggleAuthLink: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  toggleAuthText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },

  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background, 
    padding: 5, 
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.sm,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6, 
    borderRadius: theme.radius.md,
    marginHorizontal: 3, 
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.icon.bg,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      }
    }),
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    marginLeft: 4,
  },
  segmentTextActive: {
    color: theme.colors.icon.primary,
  },

  subtabContainer: {
    marginTop: theme.spacing.smd,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing.smd,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextContainer: {
    flex: 1,
  },
});
