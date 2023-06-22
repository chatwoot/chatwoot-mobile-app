import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import i18n from 'i18n';
import { useDispatch } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Icon, Pressable } from 'components';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import conversationActions from 'reducer/conversationSlice.action';
import { CONVERSATION_EVENTS } from 'constants/analyticsEvents';
import { CONVERSATION_PRIORITY } from 'src/constants/index';
import { HIGH, MEDIUM, LOW, NONE, URGENT } from 'src/constants/PrioritySVG';

const propTypes = {
  colors: PropTypes.object,
  conversationId: PropTypes.number,
  activePriority: PropTypes.string,
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

const priorityItems = [
  {
    id: null,
    name: i18n.t('CONVERSATION.PRIORITY.OPTIONS.NONE'),
    icon: NONE,
  },
  {
    id: CONVERSATION_PRIORITY.URGENT,
    name: i18n.t('CONVERSATION.PRIORITY.OPTIONS.URGENT'),
    icon: URGENT,
  },
  {
    id: CONVERSATION_PRIORITY.HIGH,
    name: i18n.t('CONVERSATION.PRIORITY.OPTIONS.HIGH'),
    icon: HIGH,
  },
  {
    id: CONVERSATION_PRIORITY.MEDIUM,
    name: i18n.t('CONVERSATION.PRIORITY.OPTIONS.MEDIUM'),
    icon: MEDIUM,
  },
  {
    id: CONVERSATION_PRIORITY.LOW,
    name: i18n.t('CONVERSATION.PRIORITY.OPTIONS.LOW'),
    icon: LOW,
  },
];

const SnoozeConversation = ({ colors, conversationId, activePriority, closeModal }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();

  const changePriority = item => {
    try {
      AnalyticsHelper.track(CONVERSATION_EVENTS.TOGGLE_STATUS);
      dispatch(
        conversationActions.togglePriority({
          conversationId: conversationId,
          priority: item,
        }),
      );
    } catch (error) {}
    closeModal();
  };

  return (
    <View style={styles.bottomSheet}>
      <View style={styles.bottomSheetContent}>
        {priorityItems.map((item, index) => (
          <Pressable
            style={[
              styles.bottomSheetItem,
              activePriority === item.id && styles.bottomSheetItemActive,
            ]}
            key={item.id}
            onPress={() => changePriority(item.id)}>
            <View style={styles.itemView}>
              <SvgXml xml={item.icon} width={22} height={22} />
              <Text sm medium color={colors.textDark} style={styles.itemText}>
                {item.name}
              </Text>
            </View>
            <View>
              {activePriority === item.id && (
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
