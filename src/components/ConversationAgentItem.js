import React, { useMemo, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, StyleSheet, TextInput } from 'react-native';
import PropTypes from 'prop-types';
import { Text, Icon, Pressable, UserAvatar } from 'components';
import i18n from 'i18n';

const propTypes = {
  colors: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  agentsList: PropTypes.array.isRequired,
  activeValue: PropTypes.array.isRequired,
  onClick: PropTypes.func,
};

const createStyles = theme => {
  const { spacing, colors, borderRadius, fontSize } = theme;
  return StyleSheet.create({
    bottomSheet: {
      flex: 1,
    },
    bottomSheetContent: {
      marginBottom: spacing.large,
      position: 'relative',
    },
    bottomSheetItem: {
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      paddingVertical: spacing.smaller,
      paddingHorizontal: spacing.half,
      backgroundColor: colors.background,
      marginBottom: spacing.tiny,
      borderWidth: 0.6,
      height: 42,
      borderColor: 'transparent',
      borderRadius: borderRadius.small,
    },
    bottomSheetItemActive: {
      backgroundColor: colors.backgroundLight,
      borderColor: colors.borderLight,
    },
    bottomSheetItemView: {
      height: '100%',
      flexDirection: 'column',
      paddingTop: spacing.smaller,
      paddingVertical: spacing.half,
      paddingHorizontal: spacing.small,
    },
    searchWrap: {
      position: 'relative',
      paddingVertical: spacing.half,
      paddingHorizontal: spacing.small,
    },
    searchInput: {
      backgroundColor: colors.backgroundLight,
      borderWidth: 0.4,
      borderColor: colors.borderLight,
      borderRadius: borderRadius.small,
      paddingRight: spacing.half,
      paddingLeft: spacing.large,
      paddingVertical: spacing.micro,
      height: spacing.large,
      fontSize: fontSize.sm,
    },
    searchIcon: {
      position: 'absolute',
      left: spacing.medium,
      top: 20,
    },
    clearIcon: {
      position: 'absolute',
      right: spacing.medium,
      top: 20,
    },
    agentDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    agentName: {
      marginLeft: spacing.smaller,
    },
    emptyView: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.small,
      marginTop: spacing.small,
    },
    itemText: {
      paddingBottom: spacing.smaller,
    },
  });
};

const ConversationAgentItem = ({ colors, title, agentsList, activeValue, onClick }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [search, setSearch] = useState('');
  const onChangeSearch = value => {
    setSearch(value);
  };

  const filteredAgentsOnSearch = agentsList.filter(agent => {
    return agent.name.toLowerCase().includes(search.toLowerCase());
  });

  const onClickAdd = id => {
    onClick(id);
  };
  return (
    <View style={styles.bottomSheet}>
      <View style={styles.bottomSheetContent}>
        <View style={styles.searchWrap}>
          <TextInput
            placeholder="Search"
            value={search}
            onChangeText={onChangeSearch}
            style={styles.searchInput}
          />
          <View style={styles.searchIcon}>
            <Icon icon="search-bold" color={colors.textDark} size={18} />
          </View>
          {search && (
            <Pressable style={styles.clearIcon} onPress={() => onChangeSearch('')}>
              <Icon icon="dismiss-circle-outline" color={colors.textDark} size={18} />
            </Pressable>
          )}
        </View>

        <View style={styles.bottomSheetItemView}>
          {filteredAgentsOnSearch.length !== 0 && (
            <Text sm medium color={colors.textDark} style={styles.itemText}>
              {title}
            </Text>
          )}
          {filteredAgentsOnSearch.map(item => (
            <Pressable
              style={[
                styles.bottomSheetItem,
                activeValue.includes(item.id) && styles.bottomSheetItemActive,
              ]}
              key={item.id}
              onPress={() => onClickAdd(item)}>
              <View style={styles.agentDetails}>
                <UserAvatar
                  thumbnail={item.thumbnail}
                  userName={item.name}
                  size={24}
                  fontSize={12}
                  availabilityStatus={item.availability_status}
                />
                <Text sm medium color={colors.text} style={styles.agentName}>
                  {`${item.name}`}
                </Text>
              </View>
              {activeValue.includes(item.id) && (
                <View>
                  <Icon icon="checkmark-outline" color={colors.textDark} size={20} />
                </View>
              )}
            </Pressable>
          ))}
          {filteredAgentsOnSearch && filteredAgentsOnSearch.length === 0 && (
            <View style={styles.emptyView}>
              <Text sm medium color={colors.textDark}>
                {i18n.t('CONVERSATION_AGENTS.NO_RESULT')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

ConversationAgentItem.propTypes = propTypes;
export default ConversationAgentItem;
