import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { Text, Icon } from 'components';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import BottomSheetModal from 'components/BottomSheet/BottomSheet';
import { evaluateSLAStatus } from 'helpers/SLAHelper';
import SLAMisses from './SLAMisses';

const REFRESH_INTERVAL = 60000;

const createStyles = theme => {
  const { spacing, colors } = theme;
  return StyleSheet.create({
    cardLabelWrap: {
      marginTop: spacing.micro,
      paddingTop: spacing.tiny,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    labelView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 4,
      marginRight: 4,
      marginBottom: 4,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 0.5,
      borderColor: colors.borderLight,
      gap: 4,
    },
    line: {
      height: 12,
      width: 1,
      backgroundColor: colors.borderLight,
      marginHorizontal: 4,
    },
  });
};

const propTypes = {
  conversationDetails: PropTypes.object,
  showExtendedInfo: PropTypes.bool,
};

const deviceHeight = Dimensions.get('window').height;
const ConversationLabel = ({ conversationDetails, showExtendedInfo = false }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Filter by assignee type
  const conversationAssigneeModal = useRef(null);
  const toggleConversationAssigneeModal = useCallback(() => {
    conversationAssigneeModal.current.present() || conversationAssigneeModal.current?.dismiss();
  }, []);
  const closeConversationAssigneeModal = useCallback(() => {
    conversationAssigneeModal.current?.dismiss();
  }, []);

  // Conversation filter modal
  const conversationFilterModalSnapPoints = useMemo(
    () => [deviceHeight - 400, deviceHeight - 400],
    [],
  );

  const [slaStatus, setSlaStatus] = useState(null);
  const timerRef = useRef(null);

  const appliedSLA = conversationDetails?.applied_sla || {};

  useEffect(() => {
    createTimer();
    updateSlaStatus();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [createTimer, updateSlaStatus]);

  const createTimer = useCallback(() => {
    timerRef.current = setTimeout(() => {
      updateSlaStatus();
      createTimer();
    }, REFRESH_INTERVAL);
  }, [updateSlaStatus]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateSlaStatus = () => {
    const status = evaluateSLAStatus(appliedSLA, conversationDetails);
    setSlaStatus(status);
  };

  const hasSlaThreshold = slaStatus?.threshold;

  if (!hasSlaThreshold) {
    return null;
  }

  const icon = slaStatus.isSlaMissed ? 'flame-outline' : 'alarm-outline';
  const color = slaStatus.isSlaMissed ? colors.dangerColor : colors.warningColor;
  const slaStatusText = slaStatus?.isSlaMissed ? 'SLA Missed' : 'SLA Warning';

  return (
    <TouchableOpacity style={styles.cardLabelWrap} onPress={toggleConversationAssigneeModal}>
      <View style={styles.labelView}>
        <Icon icon={icon} color={color} size={12} />
        {showExtendedInfo && (
          <Text xs medium color={color}>
            {slaStatusText}
          </Text>
        )}
        {showExtendedInfo && <View style={styles.line} />}
        <Text xs medium color={color}>
          {slaStatus.threshold}
        </Text>
      </View>
      <BottomSheetModal
        bottomSheetModalRef={conversationAssigneeModal}
        initialSnapPoints={conversationFilterModalSnapPoints}
        showHeader
        headerTitle="SLA Misses"
        closeFilter={closeConversationAssigneeModal}
        children={<SLAMisses slaMissedEvents={conversationDetails.sla_events} />}
      />
    </TouchableOpacity>
  );
};

ConversationLabel.propTypes = propTypes;
export default ConversationLabel;
