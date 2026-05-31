import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Standardized premium card design tokens
const getCardStyle = (theme) => ({
  backgroundColor: theme.colors.surface, // Clean white surface
  borderRadius: theme.radius.xl, // 15
  borderWidth: 1,
  borderColor: theme.colors.border.light,
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 8,
  elevation: 2,
});

export const getStyles = (theme) => {
  const CARD_STYLE = getCardStyle(theme);
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Match light theme slate background (#F1F5F9)
    paddingHorizontal: 0,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.border.light,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    marginRight: 10,
  },
  backButtonText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },

  // Dashboard Styles
  dashboardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
  },
  centralDateBlock: {
    ...CARD_STYLE,
    backgroundColor: theme.colors.icon.bg, // Light blue dashboard statistics block!
    borderWidth: 0, // Clean flat container
    alignItems: 'stretch',
    justifyContent: 'center',
    marginVertical: 10,
    padding: 24,
    width: '100%',
  },
  dateButton: {
    width: 116,
    height: 116,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 3.5,
    borderColor: theme.colors.primary,
  },
  dateNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF', // Keep white since date button is colored dynamically
  },
  dateMonth: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F8FAFC', // Keep white contrast
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 130, 246, 0.15)', // Soft blue border divider
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  gridContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 15,
    marginTop: 10,
    flex: 1,
    marginBottom: 20,
  },
  menuCard: {
    ...CARD_STYLE,
    backgroundColor: theme.colors.icon.bg, // Light blue menu cards!
    borderWidth: 2,
    borderColor: theme.colors.icon.primary, // Icon color from theme (#3B82F6)
    flexDirection: 'row',
    alignItems: 'center',
    padding: 32,
    flex: 1,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 3,
  },

  // Modal / Calendar Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Dim background overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.surface, // Light theme surface
    borderRadius: theme.radius.xl, // 15
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  calendarCell: {
    width: (width - 130) / 7,
    height: (width - 130) / 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.border.light, // Match theme border/divider
  },
  calendarCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  calendarCellTextActive: {
    color: '#FFFFFF', // White text on mood-colored background
    fontWeight: 'bold',
  },
  dayDetailBlock: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  dayDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  dayDetailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayDetailItem: {
    alignItems: 'center',
  },
  dayDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 4,
  },

  // Habits Subtab Styles
  inputBlock: {
    flexDirection: 'row',
    paddingBottom: theme.spacing.xl,
    borderBottomWidth: 1,
    borderColor: theme.colors.border.light,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl, // Add padding to align with Swipeables in RpgTab
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface, // Clean white surface
    borderRadius: theme.radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: theme.colors.text.primary,
    fontSize: 16,
    elevation: 2,
  },
  typeToggleButton: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  addButton: {
    backgroundColor: theme.colors.primaryLight, // Premium light blue background matching other tabs
    borderRadius: theme.radius.lg,
    width: 50,
    height: 48, // Matches text input height
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  habitList: {
    paddingTop: 6,
    paddingBottom: 20,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface, // White card item
    borderRadius: theme.radius.xl, // 15
    elevation: 1,
    overflow: 'hidden', // Required for seamless child element clipping
    position: 'relative',
  },
  habitIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '500',
    marginLeft: 16, // Shift spacing beautifully from the left border block
    marginVertical: 16, // Set vertical margin to match standard todoItem heights perfectly
  },
  habitCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.secondary,
    marginRight: 16, // Spacing from the right border block
  },
  habitIncrementBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.background, // Clean theme background
  },

  // Piggy Bank Subtab Styles
  piggyCard: {
    ...CARD_STYLE,
    backgroundColor: theme.colors.surface, // Explicitly keep white!
    padding: 20,
    marginBottom: 20,
  },
  piggyInputRowContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: theme.spacing.xl,
    borderBottomWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'stretch',
    paddingHorizontal: theme.spacing.xl,
  },
  piggyCreateRightButton: {
    width: 120,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  piggyCreateRightButtonText: {
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  piggyInputColumn: {
    flex: 1,
    flexDirection: 'column',
    gap: 10,
  },
  piggyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  piggyGoalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  piggyProgressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669', // Emerald green in light mode
  },
  piggyTarget: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: theme.colors.border.light, // Soft gray theme track
    borderRadius: 5,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34D399',
    borderRadius: 5,
  },
  piggyForm: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  piggyInput: {
    flex: 1,
    backgroundColor: theme.colors.background, // Slightly lighter inputs matching theme bg
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    textAlign: 'center',
  },
  piggyButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  quickAddRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickAddBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background, // Clean theme background gray
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddText: {
    color: theme.colors.text.primary,
    fontWeight: '600',
    fontSize: 12,
  },

  // TV Shows Subtab Styles
  showCard: {
    backgroundColor: 'transparent', // Transparent card block to allow floating title/controls island cutouts!
    borderWidth: 0,
    padding: 0,
    overflow: 'visible',
  },
  showTitleBlock: {
    ...CARD_STYLE,
    borderWidth: 0, // Clean flat white container
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 0, // Remove bottom margin so control blocks are a continuation
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1, // Draw title block on top to cover upward shadow from controls
  },
  showTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.icon.primary,
    textAlign: 'center',
  },
  showControlsRow: {
    flexDirection: 'row',
    width: '100%',
    height: 48,
    alignItems: 'stretch',
    backgroundColor: 'transparent', // Transparent to let the screen background show through
    gap: 12, // Beautiful middle gap between Season and Episode controls
  },
  showControlGroupLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch', // Stretch vertically to completely eliminate the 1px bottom seam!
    justifyContent: 'space-between', // Pushed to the edges!
    backgroundColor: theme.colors.icon.bg, // Matches theme.colors.icon.bg / theme.colors.primaryLight (#d9e7fd)
    borderBottomLeftRadius: theme.radius.xl, // 15
    borderBottomRightRadius: theme.radius.xl, // 15 - Rounded inner corner to match gap
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  showControlGroupRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch', // Stretch vertically to completely eliminate the 1px bottom seam!
    justifyContent: 'space-between', // Pushed to the edges!
    backgroundColor: theme.colors.icon.bg, // Matches theme.colors.icon.bg / theme.colors.primaryLight (#d9e7fd)
    borderBottomRightRadius: theme.radius.xl, // 15
    borderBottomLeftRadius: theme.radius.xl, // 15 - Rounded inner corner to match gap
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  showControlLabel: {
    color: theme.colors.text.secondary,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  showControlValue: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 14,
    textAlign: 'center',
  },
  showControlBtn: {
    width: 48,
    backgroundColor: theme.colors.icon.bg, // Matches theme's icon bg color (#d9e7fd)
    borderWidth: 2, // Increased to 2!
    borderColor: theme.colors.icon.primary, // Matches theme's primary icon color (#3B82F6)

    alignItems: 'center',
    justifyContent: 'center',
  },
  showControlBtnLeft: {
    borderBottomLeftRadius: theme.radius.xl, // 15
  },
  showControlBtnRight: {
    borderBottomRightRadius: theme.radius.xl, // 15
  },
  showControlBtnCenterLeft: {
    borderBottomRightRadius: 15,
  },
  showControlBtnCenterRight: {
    borderBottomLeftRadius: 15,
  },
  movieBadge: {
    backgroundColor: '#6366F1',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  movieBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Premium Centered White Keyboard Movie Suggestion styles
  keyboardSuggestionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface, // Clean theme surface background
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center content horizontally
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: theme.colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 5,
  },
  keyboardSuggestionText: {
    color: theme.colors.text.primary, // Dark gray text
    fontWeight: '600',
    fontSize: 16, // Slightly larger text
  },
  keyboardSuggestionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.sm, // 6
    borderWidth: 2,
    borderColor: theme.colors.primary, // Blue accent
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  keyboardSuggestionCheckboxChecked: {
    backgroundColor: theme.colors.primary, // Filled blue when checked
  },
  dashboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dashboardStatsColumn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 16,
    marginLeft: 24,
  },
  statItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeToggleButtonCompact: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  addButtonLarge: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
    elevation: 1,
  },
  piggyCardCompact: {
    ...CARD_STYLE,
    borderWidth: 0, // remove the border from this entire card block!
    backgroundColor: theme.colors.surface,
    padding: 0, // Zero padding for seamless header cutting
    overflow: 'hidden', // Crops the header banner corners perfectly
    borderRadius: theme.radius.xl,
  },
  piggyCardHeader: {
    backgroundColor: theme.colors.icon.bg, // theme's icon background color
    paddingTop: 10,
    paddingBottom: 12, // vertical spacing accommodates inset progress bar
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  piggyCardProgressBarTrack: {
    height: 12, // elegant taller height for high readability
    backgroundColor: theme.colors.background, // theme background track background!
    width: '100%', // full width of the header text area
    borderRadius: 6, // rounded pill shape
    overflow: 'hidden',
    marginTop: 8, // elegant top spacing below the title text
  },
  piggyCardProgressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary, // beautiful primary theme blue
    borderRadius: 6, // rounded fill end
  },
  piggyCardBody: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0, // remove left padding to allow target badge docking
    paddingRight: 0, // remove right padding to allow input docking
  },
  piggyRowOne: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0, // remove bottom margin
    height: 56, // perfect vertical row height
  },
  piggyLeftColumnCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Align right towards center
    alignSelf: 'stretch', // Stretch vertically to occupy full card height
  },
  piggyCenterColumnCompact: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch', // Stretch vertically to occupy full card height
  },
  piggyRightColumnCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // centers the absolute placeholder icon perfectly
    alignSelf: 'stretch', // Stretch vertically to occupy full card height
  },
  piggyCurrentTextCompact: {
    fontSize: 18,
    color: theme.colors.text.secondary, // normal/ordinary color by default
    textAlign: 'center',
    fontWeight: 'bold', // bolded current progress
  },
  piggyCurrentContainerCompact: {
    width: '100%', // stretches to fill the center column container beautifully
    height: '100%', // 100% height to match stretched column height
    backgroundColor: theme.colors.surface, // solid white background matching input
    borderWidth: 4, // same border width as input
    borderRightWidth: 0, // avoid double border line with input
    borderColor: theme.colors.icon.bg, // set to icon background color (#d9e7fd)
    alignItems: 'center',
    justifyContent: 'center',
  },
  piggyCurrentContainerCompactCompleted: {
    backgroundColor: theme.colors.icon.bg, // theme's light blue completion bg
  },
  piggyTargetBadge: {
    width: '100%', // stretches to fill the left column container beautifully
    height: '100%', // 100% height to match stretched column height
    backgroundColor: theme.colors.icon.bg, // light blue background matching icon bg
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  piggyVerticalDivider: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: -2, // bleed slightly to eliminate top/bottom gaps
    width: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // matching header bottom border color
  },
  piggyTargetTextCompact: {
    fontSize: 18,
    color: theme.colors.icon.primary, // theme blue color matching icon style
    textAlign: 'center',
    fontWeight: 'bold',
    fontStyle: 'italic', // italicized target amount
  },
  piggyTitleText: {
    fontSize: 18, // Larger goal title
    fontWeight: 'bold',
    fontStyle: 'italic', // beautiful italic style
    color: theme.colors.icon.primary, // bold theme blue color
    textAlign: 'center',
  },
  piggyInputCompact: {
    width: '100%', // stretches to fill the right column flex container beautifully
    height: '100%', // 100% height to match stretched column height
    backgroundColor: theme.colors.surface, // solid theme surface background when unfocused
    borderWidth: 4, // full border restored
    borderColor: theme.colors.icon.bg, // set to icon background color (#d9e7fd)
    borderTopRightRadius: 0,
    borderBottomRightRadius: theme.radius.xl, // perfectly adjusted inner curve (14) to match the inner card border
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    paddingHorizontal: 2, // Kept small to align focused caret/cursor perfectly in the center
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.icon.primary, // blue text matching icons
    textAlign: 'center', // Center placeholder and input text
    paddingVertical: 0,
    // Bleed slightly outside to overlap card borders and completely eliminate sub-pixel seams
  },
  piggyInputCompactFocused: {
    backgroundColor: 'rgba(59, 130, 246, 0.06)', // soft light blue focus tint
    borderColor: theme.colors.icon.primary, // solid theme blue border
    borderWidth: 4, // full border thickness
  },
  piggyInputCoinsPlaceholder: {
    position: 'absolute',
    flexDirection: 'row', // align plus and coins horizontally!
    alignItems: 'center',
    justifyContent: 'center',
  },
  piggyFloatingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 52,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    gap: 15,
  },
  piggyFloatingBtn: {
    flex: 1,
    height: 38,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    gap: 6,
  },
  piggyFloatingBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  });
};
