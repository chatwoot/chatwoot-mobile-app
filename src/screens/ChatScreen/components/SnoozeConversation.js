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
import BottomSheetPageHeader from 'src/components/BottomSheet/BottomSheetPageHeader';
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
      backgroundColor: colors.backgroundLight,
      borderRadius: borderRadius.small,
      marginTop: spacing.small,
    },
    bottomSheetItem: {
      flexDirection: 'row',
      paddingVertical: spacing.half,
      paddingHorizontal: spacing.half,
      borderBottomWidth: 0.4,
      borderRadius: borderRadius.small,
      borderBottomColor: colors.borderLight,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    bottomSheetLastItem: {
      borderBottomWidth: 0,
    },
    itemView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemText: {
      marginLeft: spacing.smaller,
    },
    itemBoldText: {
      marginLeft: spacing.micro,
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

  const toggleStatus = key => {
    setSelectedItem(key);
  };

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
      <BottomSheetPageHeader
        title={i18n.t('CONVERSATION.SNOOZE')}
        actionButtonText={i18n.t('CONVERSATION.UPDATE')}
        actionButtonIcon="checkmark-circle-outline"
        updateButton={() => toggleStatusForConversations(selectedItem)}
        colors={colors}
      />
      <View style={styles.bottomSheetContent}>
        {snoozeItems.map((item, index) => (
          <Pressable
            style={styles.bottomSheetItem}
            key={item.key}
            onPress={() => toggleStatus(item.key)}>
            <View style={styles.itemView}>
              <Icon icon={item.icon} color={colors.textDark} size={18} />
              <Text sm medium color={colors.textDark} style={styles.itemText}>
                {i18n.t('CONVERSATION.SNOOZE_UNTIL')}
              </Text>
              <Text sm semiBold color={colors.textDark} style={styles.itemBoldText}>
                {item.title}
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
