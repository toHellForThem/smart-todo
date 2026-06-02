import { memo } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

export const TvShowsSubtab = memo(({
  activeShows,
  showTitle,
  setShowTitle,
  isMovieInput,
  setIsMovieInput,
  startEpisode,
  setStartEpisode,
  keyboardHeight,
  isKeyboardVisible,
  handleAddShow,
  statusChangeTask,
  deleteToRecycle,
  renderSwipeLeft,
  styles,
  theme,
  t,
}) => {
  return (
    <View style={styles.container}>
      <View style={{ marginTop: 10 }} />

      <View style={styles.inputBlock}>
        <TextInput
          style={styles.input}
          placeholder={t('rpg_tv_placeholder')}
          placeholderTextColor="#94A3B8"
          cursorColor={theme.colors.icon.primary}
          selectionColor={theme.colors.icon.primary}
          value={showTitle}
          onChangeText={setShowTitle}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddShow}>
          <MaterialCommunityIcons
            style={{ borderRadius: 10, backgroundColor: theme.colors.icon.bg }}
            name={'plus-thick'}
            size={24}
            color={theme.colors.icon.primary}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeShows}
        bounces={false}
        overScrollMode="never"
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 6, paddingBottom: 80 }}
        delaysContentTouches={false}
        renderItem={({ item }) => (
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
            activeOffsetX={[-15, 15]}
            failOffsetY={[-15, 15]}
          >
            <View style={styles.showCard}>
              {item.type === 'movie' ? (
                <View style={[
                  styles.showTitleBlock,
                  { borderBottomLeftRadius: theme.radius.xl, borderBottomRightRadius: theme.radius.xl },
                  item.completed && { backgroundColor: theme.colors.icon.bg }
                ]}>
                  <Text style={[
                    styles.showTitle,
                    { flex: 1, textAlign: 'left', marginRight: 48, marginBottom: 0 }
                  ]}>
                    {item.text}
                  </Text>
                  <TouchableOpacity
                    onPress={() => statusChangeTask(item.id)}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: 48,
                      backgroundColor: theme.colors.icon.bg,
                      borderTopRightRadius: theme.radius.xl,
                      borderBottomRightRadius: theme.radius.xl,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  >
                    <MaterialCommunityIcons
                      name={item.completed ? 'check-bold' : 'check'}
                      size={22}
                      color={theme.colors.icon.primary}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={[
                    styles.showTitleBlock,
                    item.completed && { backgroundColor: theme.colors.icon.bg }
                  ]}>
                    <Text style={[
                      styles.showTitle,
                      { flex: 1, textAlign: 'left', marginRight: 48 }
                    ]}>
                      {item.text}
                    </Text>
                    <TouchableOpacity
                      onPress={() => statusChangeTask(item.id, 'toggle_complete')}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 48,
                        backgroundColor: theme.colors.icon.bg,
                        borderTopRightRadius: theme.radius.xl,
                        borderBottomRightRadius: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                      <MaterialCommunityIcons
                        name={item.completed ? 'check-bold' : 'check'}
                        size={22}
                        color={theme.colors.icon.primary}
                      />
                    </TouchableOpacity>
                  </View>
                  {(() => {
                    let [season, episode] = (item.progressNow || "1-1").toString().split('-').map(Number);
                    if (isNaN(season)) season = 1;
                    if (isNaN(episode)) episode = 1;

                    return (
                      <View style={styles.showControlsRow}>
                        <View style={styles.showControlGroupLeft}>
                          <TouchableOpacity
                            disabled={item.completed}
                            onPress={() => statusChangeTask(item.id, -1, 'season')}
                            style={[styles.showControlBtn, styles.showControlBtnLeft]}
                          >
                            <Ionicons name="remove" size={22} color={item.completed ? '#94A3B8' : theme.colors.primary} />
                          </TouchableOpacity>
                          <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                            <Text style={styles.showControlLabel}>{t('rpg_tv_season')}</Text>
                            <Text style={styles.showControlValue}>{season}</Text>
                          </View>
                          <TouchableOpacity
                            disabled={item.completed}
                            onPress={() => statusChangeTask(item.id, 1, 'season')}
                            style={[styles.showControlBtn, styles.showControlBtnCenterLeft]}
                          >
                            <Ionicons name="add" size={22} color={item.completed ? '#94A3B8' : theme.colors.primary} />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.showControlGroupRight}>
                          <TouchableOpacity
                            disabled={item.completed}
                            onPress={() => statusChangeTask(item.id, -1, 'episode')}
                            style={[styles.showControlBtn, styles.showControlBtnCenterRight]}
                          >
                            <Ionicons name="remove" size={22} color={item.completed ? '#94A3B8' : theme.colors.primary} />
                          </TouchableOpacity>
                          <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                            <Text style={styles.showControlLabel}>{t('rpg_tv_ep')}</Text>
                            <Text style={styles.showControlValue}>{episode}</Text>
                          </View>
                          <TouchableOpacity
                            disabled={item.completed}
                            onPress={() => statusChangeTask(item.id, 1, 'episode')}
                            style={[styles.showControlBtn, styles.showControlBtnRight]}
                          >
                            <Ionicons name="add" size={22} color={item.completed ? '#94A3B8' : theme.colors.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })()}
                </>
              )}
            </View>
          </Swipeable>
        )}
      />

      <View
        pointerEvents={isKeyboardVisible ? 'auto' : 'none'}
        style={[styles.keyboardSuggestionBar, {
          bottom: keyboardHeight - 71,
          opacity: isKeyboardVisible ? 1 : 0
        }]}
      >
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
          onPress={() => setIsMovieInput(prev => !prev)}
          activeOpacity={0.8}
        >
          <Text style={styles.keyboardSuggestionText}>{t('rpg_tv_is_movie')}</Text>
          <View style={[
            styles.keyboardSuggestionCheckbox,
            isMovieInput && styles.keyboardSuggestionCheckboxChecked
          ]}>
            {isMovieInput && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>

        <View style={{ width: 1, height: 24, backgroundColor: theme.colors.border.light, marginHorizontal: 16 }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: isMovieInput ? 0.35 : 1 }}>
          <Text style={styles.keyboardSuggestionText}>{t('rpg_tv_episode')}</Text>
          <TextInput
            style={{
              width: 48,
              height: 32,
              borderRadius: theme.radius.sm,
              borderWidth: 1.5,
              borderColor: isMovieInput ? theme.colors.border.light : theme.colors.primary,
              backgroundColor: theme.colors.background,
              color: theme.colors.text.primary,
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 14,
              padding: 0,
            }}
            value={startEpisode}
            onChangeText={text => {
              const digits = text.replace(/[^0-9]/g, '');
              setStartEpisode(digits);
            }}
            keyboardType="numeric"
            editable={!isMovieInput}
            selectTextOnFocus={true}
          />
        </View>
      </View>
    </View>
  );
});
