import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import i18n from 'i18n';
import { useDispatch } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Icon, Pressable } from 'components';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import conversationActions from 'reducer/conversationSlice.action';
import { CONVERSATION_EVENTS } from 'constants/analyticsEvents';
import { CONVERSATION_STATUS } from 'src/constants/index';
import { getUnixTime, addHours, addWeeks, startOfTomorrow, startOfWeek } from 'date-fns';

const propTypes = {
  colors: PropTypes.object,
  conversationId: PropTypes.number,
  activeSnoozeValue: PropTypes.string,
  closeModal: PropTypes.func,
};

const createStyles = theme => {
  const { spacing, colors, borderRadius } = theme;
  return StyleSheet.create({
    bottomSheet: {
      flex: 1,
      paddingHorizontal: spacing.small,
    },
    bottomSheetContent: {
      marginTop: spacing.small,
      marginBottom: spacing.large,
    },
    bottomSheetItem: {
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      borderBottomColor: colors.borderLight,
      paddingVertical: spacing.half,
      paddingHorizontal: spacing.half,
      borderBottomWidth: 0.4,
      borderRadius: borderRadius.small,
    },
    itemView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemText: {
      marginLeft: spacing.smaller,
    },
  });
};

const snoozeItems = [
  {
    key: 'nextReply',
    icon: 'send-clock-outline',
    title: 'Next Reply',
  },
  {
    key: 'tomorrow',
    icon: 'dual-screen-clock-outline',
    title: 'Tomorrow',
  },
  {
    key: 'nextWeek',
    icon: 'calendar-clock-outline',
    title: 'Next Week',
  },
];

const SnoozeConversation = ({ colors, conversationId, activeSnoozeValue, closeModal }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();

  useEffect(() => {
    setSelectedItem(activeSnoozeValue);
  }, [activeSnoozeValue]);

  const [selectedItem, setSelectedItem] = useState('');

  const snoozeTimes = {
    reply: null,
    tomorrow: getUnixTime(addHours(startOfTomorrow(), 9)),
    nextWeek: getUnixTime(addHours(startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }), 9)),
  };

  const toggleStatusForConversations = item => {
    if (item !== '') {
      try {
        AnalyticsHelper.track(CONVERSATION_EVENTS.TOGGLE_STATUS);
        dispatch(
          conversationActions.toggleConversationStatus({
            conversationId: conversationId,
            status: CONVERSATION_STATUS.SNOOZED,
            snoozedUntil: snoozeTimes[item],
          }),
        );
      } catch (error) {}
    }
    closeModal();
  };

  return (
    <View style={styles.bottomSheet}>
      <View style={styles.bottomSheetContent}>
        {snoozeItems.map((item, index) => (
          <Pressable
            style={[
              {
                backgroundColor: selectedItem === item.key && colors.primaryColorLight,
              },
              styles.bottomSheetItem,
            ]}
            key={item.key}
            onPress={() => toggleStatusForConversations(item.key)}>
            <View style={styles.itemView}>
              <Icon icon={item.icon} color={colors.textDark} size={18} />
              <Text sm medium color={colors.textDark} style={styles.itemText}>
                {`${i18n.t('CONVERSATION.SNOOZE_UNTIL')} ${item.title}`}
              </Text>
            </View>
            <View>
              {selectedItem === item.key && (
                <Icon icon="checkmark-outline" color={colors.textDark} size={18} />
              )}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

SnoozeConversation.propTypes = propTypes;
export default SnoozeConversation;
