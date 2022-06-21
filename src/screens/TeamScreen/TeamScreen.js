/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Spinner, withStyles } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView, View, ScrollView, Text } from 'react-native';

import LoaderButton from '../../components/LoaderButton';
import HeaderBar from '../../components/HeaderBar';
import i18n from '../../i18n';
import styles from './TeamScreen.style';
import TeamList from 'src/components/TeamList';
import { getAllTeams, assignTeam } from '../../actions/team';
import { captureEvent } from 'helpers/Analytics';
import Snackbar from 'react-native-snackbar';

const TeamScreenComponent = ({ eva: { style }, navigation, route }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllTeams());
  }, [dispatch]);
  const { conversationDetails } = route.params;
  const {
    meta: { team },
  } = conversationDetails;

  const [selectedTeamId, setTeam] = useState(team ? team.id : null);
  const teams = useSelector(state => state.conversation.availableTeams);
  const conversation = useSelector(state => state.conversation);
  const { isAllAvailableTeamsLoaded, isTeamUpdating } = conversation;

  const goBack = () => {
    navigation.goBack();
  };

  const onClickCheckedChange = item => {
    setTeam(item.id);
  };

  const teamsList = () => {
    if (team && team.id) {
      return [
        {
          id: 0,
          name: 'None',
        },
        ...teams,
      ];
    }
    return teams;
  };

  const onClickAssignTeam = () => {
    if (!team || team.id !== selectedTeamId) {
      captureEvent({ eventName: 'Conversation team changed' });
      dispatch(
        assignTeam({
          conversationId: conversationDetails.id,
          teamId: selectedTeamId,
        }),
      ).then(() => {
        Snackbar.show({
          text: i18n.t('TEAMS.CHANGE_TEAMS'),
          duration: Snackbar.LENGTH_SHORT,
        });
      });
    } else {
      navigation.goBack();
    }
  };
  return (
    <SafeAreaView style={style.container}>
      <HeaderBar title={i18n.t('TEAMS.TITLE')} showLeftButton onBackPress={goBack} />

      {teams ? (
        <ScrollView>
          {teamsList().map(item => (
            <TeamList
              name={item.name}
              key={item.id}
              selectedTeam={item.id === selectedTeamId}
              onClickCheckedChange={() => onClickCheckedChange(item)}
            />
          ))}
          {isAllAvailableTeamsLoaded && (
            <View style={style.spinnerView}>
              <Spinner size="medium" />
            </View>
          )}
          <View style={style.submitButtonView}>
            <LoaderButton
              style={style.submitButton}
              size="large"
              textStyle={style.submitButtonText}
              onPress={() => onClickAssignTeam()}
              text={i18n.t('SETTINGS.SUBMIT')}
              loading={isTeamUpdating}
            />
          </View>
        </ScrollView>
      ) : (
        <View>
          <Text style={style.emptyTeamsLabel}>{i18n.t('TEAMS.EMPTY')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const TeamScreen = withStyles(TeamScreenComponent, styles);
export default TeamScreen;
