import { memo } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

export const PiggyBankSubtab = memo(({
  piggyGoalItems,
  piggyGoal,
  setPiggyGoal,
  piggyTarget,
  setPiggyTarget,
  piggyInputs,
  setPiggyInputs,
  focusedGoalId,
  setFocusedGoalId,
  flashingGoalId,
  isKeyboardVisible,
  keyboardHeight,
  handleSavePiggyGoal,
  handleUpdatePiggy,
  handleScroll,
  flatListRef,
  deleteToRecycle,
  renderSwipeLeft,
  styles,
  theme,
  t,
}) => {
  return (
    <View style={styles.container}>
      <View style={{ marginTop: 10 }} />

      <View style={styles.piggyInputRowContainer}>
        <View style={styles.piggyInputColumn}>
          <TextInput
            style={[styles.input, { flex: 0, width: '100%', marginBottom: 0 }]}
            placeholder={t('rpg_piggy_title_placeholder')}
            placeholderTextColor="#94A3B8"
            cursorColor={theme.colors.icon.primary}
            selectionColor={theme.colors.icon.primary}
            value={piggyGoal}
            onChangeText={setPiggyGoal}
          />
          <TextInput
            style={[styles.input, { flex: 0, width: '100%', marginBottom: 0 }]}
            placeholder={t('rpg_piggy_target_placeholder')}
            placeholderTextColor="#94A3B8"
            cursorColor={theme.colors.icon.primary}
            selectionColor={theme.colors.icon.primary}
            keyboardType="numeric"
            value={piggyTarget}
            onChangeText={setPiggyTarget}
          />
        </View>

        <TouchableOpacity style={styles.piggyCreateRightButton} onPress={handleSavePiggyGoal}>
          <Text style={styles.piggyCreateRightButtonText}>{t('rpg_piggy_create')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={piggyGoalItems}
        bounces={false}
        overScrollMode="never"
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 6, paddingBottom: isKeyboardVisible ? keyboardHeight : 0 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const isCompleted = (item.progressNow || 0) >= item.progressEnd;
          const progressPercent = isCompleted
            ? 100
            : Math.max(0, Math.min(99, Math.floor(((item.progressNow || 0) / item.progressEnd) * 100)));
          return (
            <Swipeable
              friction={1.6}
              leftThreshold={78}
              overshootLeft={true}
              renderLeftActions={renderSwipeLeft}
              onSwipeableLeftOpen={() => deleteToRecycle(item.id)}
              containerStyle={{
                paddingTop: 2,
                paddingBottom: 8,
                paddingHorizontal: 20,
                backgroundColor: 'transparent',
              }}
            >
              <View style={styles.piggyCardCompact}>
                <View style={styles.piggyCardHeader}>
                  <Text style={styles.piggyTitleText}>
                    {item.text}
                  </Text>

                  <View style={styles.piggyCardProgressBarTrack}>
                    <View style={[
                      styles.piggyCardProgressBarFill,
                      { width: `${progressPercent}%` }
                    ]} />
                  </View>
                </View>

                <View style={styles.piggyCardBody}>
                  <View style={styles.piggyRowOne}>
                    <View style={styles.piggyLeftColumnCompact}>
                      <View style={styles.piggyTargetBadge}>
                        <Text style={styles.piggyTargetTextCompact} numberOfLines={1} adjustsFontSizeToFit={true}>
                          {item.progressEnd}
                        </Text>
                      </View>
                      <View style={styles.piggyVerticalDivider} />
                    </View>

                    <View style={styles.piggyCenterColumnCompact}>
                      <View style={[
                        styles.piggyCurrentContainerCompact,
                        isCompleted && styles.piggyCurrentContainerCompactCompleted,
                        flashingGoalId === item.id && { borderColor: theme.colors.icon.primary }
                      ]}>
                        <Text style={[
                          styles.piggyCurrentTextCompact,
                          (isCompleted || flashingGoalId === item.id) && { color: theme.colors.icon.primary }
                        ]} numberOfLines={1} adjustsFontSizeToFit={true}>
                          {item.progressNow || 0}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.piggyRightColumnCompact}>
                      <TextInput
                        style={[
                          styles.piggyInputCompact,
                          focusedGoalId === item.id && styles.piggyInputCompactFocused,
                          isCompleted && { backgroundColor: theme.colors.icon.bg },
                          flashingGoalId === item.id && { borderColor: theme.colors.icon.primary }
                        ]}
                        placeholder=""
                        keyboardType="numeric"
                        cursorColor={theme.colors.icon.primary}
                        selectionColor={theme.colors.icon.primary}
                        value={piggyInputs[item.id] || ''}
                        onChangeText={(text) => setPiggyInputs(prev => ({ ...prev, [item.id]: text }))}
                        onFocus={() => setFocusedGoalId(item.id)}
                      />
                      {!piggyInputs[item.id] && focusedGoalId !== item.id && (
                        <View style={styles.piggyInputCoinsPlaceholder} pointerEvents="none">
                          {isCompleted ? (
                            <>
                              <MaterialIcons name="add-shopping-cart" size={22} color={theme.colors.icon.primary} style={{ marginRight: 2 }} />
                              <MaterialIcons name="store" size={27} color={theme.colors.icon.primary} />
                            </>
                          ) : (
                            <>
                              <FontAwesome5 name="plus" size={12} color={theme.colors.icon.bg} style={{ marginRight: 4 }} />
                              <FontAwesome5 name="coins" size={18} color={theme.colors.icon.bg} />
                            </>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </Swipeable>
          );
        }}
      />

      {isKeyboardVisible && focusedGoalId && (
        <View style={[styles.piggyFloatingContainer, {
          bottom: keyboardHeight - 71,
        }]}>
          <TouchableOpacity
            style={[styles.piggyFloatingBtn, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: '#EF4444' }]}
            onPress={() => handleUpdatePiggy(focusedGoalId, false)}
          >
            <MaterialCommunityIcons name="minus" size={20} color="#EF4444" />
            <Text style={[styles.piggyFloatingBtnText, { color: '#EF4444' }]}>{t('rpg_piggy_deduct')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.piggyFloatingBtn, { backgroundColor: 'rgba(52, 211, 153, 0.12)', borderColor: '#34D399' }]}
            onPress={() => handleUpdatePiggy(focusedGoalId, true)}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#34D399" />
            <Text style={[styles.piggyFloatingBtnText, { color: '#34D399' }]}>{t('rpg_piggy_deposit')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});
