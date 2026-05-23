import { memo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from './TabBar.styles';

export const TabBar = memo(({ currentTab, setCurrentTab }) => {
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.tab, currentTab === 'rpg' && styles.activeTab]}
        onPress={() => setCurrentTab('rpg')}
      >
        <Text style={styles.tabText}>РПГ</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, currentTab === 'todo' && styles.activeTab]}
        onPress={() => setCurrentTab('todo')}
      >
        <Text style={styles.tabText}>To do</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, currentTab === 'daily' && styles.activeTab]}
        onPress={() => setCurrentTab('daily')}
      >
        <Text style={styles.tabText}>ЕЖЕДНЕВКИ</Text>
      </TouchableOpacity>
    </View>
  );
});
