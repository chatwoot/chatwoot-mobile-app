import React, { useMemo, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { View, StyleSheet, TextInput } from 'react-native';
import PropTypes from 'prop-types';
import { Text, Icon, Pressable, UserAvatar } from 'components';
import i18n from 'i18n';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { CONVERSATION_EVENTS } from 'constants/analyticsEvents';
import { actions as teamActions, teamSelector } from 'reducer/teamSlice';

const propTypes = {
  colors: PropTypes.object,
  conversationDetails: PropTypes.object,
  closeModal: PropTypes.func,
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
      borderBottomColor: colors.borderLight,
      paddingVertical: spacing.half,
      paddingHorizontal: spacing.half,
      backgroundColor: colors.background,
      borderBottomWidth: 0.4,
      height: 46,
      borderRadius: borderRadius.small,
    },
    bottomSheetItemActive: {
      backgroundColor: colors.primaryColorLight,
      borderRightColor: colors.borderLight,
      borderRightWidth: 0.4,
      borderLeftColor: colors.borderLight,
      borderLeftWidth: 0.4,
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
    teamDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    teamName: {
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

const ConversationTeams = ({ colors, conversationDetails, closeModal }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    id: conversationId,
    meta: { team },
  } = conversationDetails;

  const dispatch = useDispatch();

  const [search, setSearch] = useState('');
  const onChangeSearch = value => {
    setSearch(value);
  };

  const [selectedTeamId, setTeam] = useState(team ? team.id : null);
  const teams = useSelector(teamSelector.selectAll);

  const isTeamSelected = team !== null;

  const teamsList = () => {
    return [
      ...(isTeamSelected && teams.length > 0
        ? [
            {
              id: 0,
              name: 'None',
            },
          ]
        : []),
      ...teams,
    ];
  };

  const filteredTeamsOnSearch = teamsList().filter(teamItem => {
    return teamItem.name.toLowerCase().includes(search.toLowerCase());
  });

  const onClickAssignTeam = id => {
    setTeam(id);
    if (!team || team.id !== id) {
      AnalyticsHelper.track(CONVERSATION_EVENTS.CHANGE_TEAM);
      dispatch(
        teamActions.update({
          conversationId: conversationId,
          teamId: id,
        }),
      );
    }
    closeModal();
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
          {filteredTeamsOnSearch.length !== 0 && (
            <Text sm medium color={colors.textDark} style={styles.itemText}>
              {i18n.t('CONVERSATION_TEAMS.SELECT_TEAM')}
            </Text>
          )}
          {filteredTeamsOnSearch.map(item => (
            <Pressable
              style={[
                styles.bottomSheetItem,
                selectedTeamId === item.id && styles.bottomSheetItemActive,
              ]}
              key={item.id}
              onPress={() => onClickAssignTeam(item.id)}>
              <View style={styles.teamDetails}>
                <UserAvatar userName={item.name} size={24} fontSize={12} />
                <Text sm medium color={colors.text} style={styles.teamName}>
                  {`${item.name}`}
                </Text>
              </View>
              {selectedTeamId === item.id && (
                <View>
                  <Icon icon="checkmark-outline" color={colors.textDark} size={20} />
                </View>
              )}
            </Pressable>
          ))}
          {filteredTeamsOnSearch && filteredTeamsOnSearch.length === 0 && (
            <View style={styles.emptyView}>
              <Text sm medium color={colors.textDark}>
                {i18n.t('CONVERSATION_TEAMS.NO_RESULT')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

ConversationTeams.propTypes = propTypes;
export default ConversationTeams;
