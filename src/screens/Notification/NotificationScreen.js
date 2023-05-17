import React, { createRef, useState, useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { SafeAreaView, View, AppState, FlatList, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import ActionSheet from 'react-native-actions-sheet';
import i18n from 'i18n';
import { Header } from 'components';
import { getCurrentRouteName } from 'helpers/NavigationHelper';
import createStyles from './NotificationScreen.style';
import NotificationItem from '../../components/NotificationItem';
import { Text } from 'components';
import NotificationItemLoader from '../../components/NotificationItemLoader';
import images from '../../constants/images';
import Empty from 'components/Empty/Empty';
import NotificationActionItem from '../../components/NotificationActionItem';
import { useEffect } from 'react';
import {
  notificationSelector,
  selectIsFetching,
  selectAllNotificationsLoaded,
  actions as notificationsActions,
} from 'reducer/notificationSlice';

const LoaderData = new Array(24).fill(0);
const renderItemLoader = () => <NotificationItemLoader />;
const actionSheetRef = createRef();
import { SCREENS } from 'constants';

const wait = timeout => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
};

// The screen list thats need to be checked for refresh conversation list
const REFRESH_SCREEN_LIST = [SCREENS.CONVERSATION, SCREENS.NOTIFICATION, SCREENS.SETTINGS];

const NotificationScreen = ({ navigation }) => {
  const [appState, setAppState] = useState(AppState.currentState);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;
  const allNotifications = useSelector(notificationSelector.selectAll);
  const isFetching = useSelector(selectIsFetching);
  const isAllNotificationsLoaded = useSelector(selectAllNotificationsLoaded);

  const notifications = allNotifications.sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const [pageNo, setPageNo] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(notificationsActions.index({ pageNo }));
  }, [dispatch, pageNo]);

  const onEndReached = () => {
    if (!isAllNotificationsLoaded) {
      setPageNo(pageNo + 1);
    }
  };

  const renderEmptyMessage = () => {
    return (
      <Empty
        image={images.emptyNotifications}
        title={i18n.t('NOTIFICATION.EMPTY')}
        subTitle={i18n.t('NOTIFICATION.EMPTY_MORE_TEXT')}
      />
    );
  };

  const renderEmptyList = () => {
    return (
      <View style={styles.tabContainer}>
        <FlatList data={LoaderData} renderItem={renderItemLoader} />
      </View>
    );
  };

  const renderMoreLoader = () => {
    return (
      <View style={styles.loadMoreSpinnerView}>
        {!isAllNotificationsLoaded ? (
          <ActivityIndicator
            size="small"
            color={colors.textDark}
            animating={!isAllNotificationsLoaded}
          />
        ) : (
          <Text sm color={colors.textLight}>
            {`${i18n.t('NOTIFICATION.ALL_NOTIFICATION_LOADED')} 🎉`}
          </Text>
        )}
      </View>
    );
  };

  // Update conversations when app comes to foreground from background
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', nextAppState => {
      if (appState === 'background' && nextAppState === 'active') {
        const routeName = getCurrentRouteName();
        if (REFRESH_SCREEN_LIST.includes(routeName)) {
          dispatch(notificationsActions.index({ pageNo }));
        }
      }
      setAppState(nextAppState);
    });
    return () => {
      appStateListener?.remove();
    };
  }, [appState, pageNo, dispatch]);

  const onSelectNotification = item => {
    const {
      primary_actor_id,
      primary_actor_type,
      primary_actor: { id: conversationId, meta },
    } = item;

    dispatch(
      notificationsActions.markNotificationAsRead({
        primaryActorId: primary_actor_id,
        primaryActorType: primary_actor_type,
      }),
    );
    navigation.navigate('ChatScreen', {
      conversationId,
      meta,
    });
  };

  const showActionSheet = () => {
    actionSheetRef.current?.setModalVisible();
  };

  const onPressAction = ({ itemType }) => {
    actionSheetRef.current?.hide();
    if (itemType === 'mark_all') {
      dispatch(notificationsActions.markAllNotificationAsRead());
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(notificationsActions.index({ pageNo }));
    wait(1000).then(() => setRefreshing(false));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        headerText={i18n.t('NOTIFICATION.HEADER_TITLE')}
        rightIcon="more-horizontal"
        onPressRight={showActionSheet}
      />
      <View style={styles.container}>
        {!isFetching || notifications.length ? (
          <React.Fragment>
            {notifications && notifications.length ? (
              <FlashList
                keyExtractor={(item, index) => item + index}
                data={notifications}
                renderItem={({ item, index }) => (
                  <NotificationItem
                    item={item}
                    read_at={item.read_at}
                    index={index}
                    onSelectNotification={onSelectNotification}
                  />
                )}
                estimatedItemSize={20}
                contentInsetAdjustmentBehavior="automatic"
                onRefresh={onRefresh}
                refreshing={refreshing}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderMoreLoader}
                onEndReached={onEndReached}
              />
            ) : (
              renderEmptyMessage()
            )}
          </React.Fragment>
        ) : (
          renderEmptyList()
        )}
      </View>
      <ActionSheet ref={actionSheetRef} initialOffsetFromBottom={0.6} defaultOverlayOpacity={0.3}>
        <NotificationActionItem
          onPressItem={onPressAction}
          text={i18n.t('NOTIFICATION.MARK_ALL')}
          itemType="mark_all"
        />
        <NotificationActionItem
          onPressItem={onPressAction}
          text={i18n.t('NOTIFICATION.CANCEL')}
          itemType="cancel"
        />
      </ActionSheet>
    </SafeAreaView>
  );
};

const propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  selectConversation: PropTypes.func,
  allNotifications: PropTypes.array.isRequired,
  isFetching: PropTypes.bool,
  isAllNotificationsLoaded: PropTypes.bool,
  getAllNotifications: PropTypes.func,
  markAllNotificationAsRead: PropTypes.func,
  markNotificationAsRead: PropTypes.func,
};

const defaultProps = {
  allNotifications: [],
  isFetching: false,
  selectConversation: () => {},
  isAllNotificationsLoaded: false,
};

NotificationScreen.propTypes = propTypes;
NotificationScreen.defaultProps = defaultProps;

export default NotificationScreen;
