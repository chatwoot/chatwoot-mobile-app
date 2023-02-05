import React, { createRef, useState } from 'react';
import { withStyles, Layout, List, Spinner } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { SafeAreaView, SectionList, View } from 'react-native';

import ActionSheet from 'react-native-actions-sheet';
import i18n from 'i18n';

import styles from './NotificationScreen.style';
import NotificationItem from '../../components/NotificationItem';
import CustomText from '../../components/Text';
import { getGroupedNotifications } from '../../helpers';
import NotificationItemLoader from '../../components/NotificationItemLoader';
import HeaderBar from '../../components/HeaderBar';
import images from '../../constants/images';
import Empty from '../../components/Empty';
import NotificationActionItem from '../../components/NotificationActionItem';
import { useEffect } from 'react';
import {
  notificationSelector,
  selectIsFetching,
  selectUnreadCount,
  selectAllNotificationsLoaded,
  actions as notificationsActions,
} from 'reducer/notificationSlice';

const LoaderData = new Array(24).fill(0);
const renderItemLoader = () => <NotificationItemLoader />;
const actionSheetRef = createRef();

const wait = timeout => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
};

const NotificationScreen = ({ eva: { style, theme }, navigation }) => {
  const allNotifications = useSelector(notificationSelector.selectAll);
  const unReadCount = useSelector(selectUnreadCount);
  const isFetching = useSelector(selectIsFetching);
  const isAllNotificationsLoaded = useSelector(selectAllNotificationsLoaded);

  const [pageNo, setPageNo] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(notificationsActions.getAllNotifications({ pageNo }));
  }, [dispatch, pageNo]);

  const loadMoreNotifications = async () => {
    if (!isAllNotificationsLoaded) {
      await setPageNo(pageNo + 1);
    }
  };

  const onEndReached = ({ distanceFromEnd }) => {
    loadMoreNotifications();
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
      <Layout style={style.tabContainer}>
        <List data={LoaderData} renderItem={renderItemLoader} />
      </Layout>
    );
  };

  const renderMoreLoader = () => {
    return (
      <View style={style.loadMoreSpinnerView}>
        {!isAllNotificationsLoaded ? (
          <Spinner size="medium" />
        ) : (
          <CustomText>{`${i18n.t('NOTIFICATION.ALL_NOTIFICATION_LOADED')} 🎉`}</CustomText>
        )}
      </View>
    );
  };

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
    dispatch(notificationsActions.getAllNotifications({ pageNo }));
    wait(1000).then(() => setRefreshing(false));
  };

  const groupedNotifications = getGroupedNotifications({ notifications: allNotifications });

  return (
    <SafeAreaView style={style.container}>
      <HeaderBar
        title={i18n.t('NOTIFICATION.HEADER_TITLE')}
        {...(groupedNotifications.length && unReadCount && { showRightButton: true })}
        onRightPress={showActionSheet}
        buttonType="more"
      />
      <View>
        {!isFetching || groupedNotifications.length ? (
          <React.Fragment>
            {groupedNotifications && groupedNotifications.length ? (
              <SectionList
                onRefresh={() => onRefresh()}
                refreshing={refreshing}
                scrollEventThrottle={16}
                onEndReached={onEndReached.bind(this)}
                onEndReachedThreshold={0.5}
                sections={groupedNotifications}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item, index }) => (
                  <NotificationItem
                    item={item}
                    read_at={item.read_at}
                    index={index}
                    onSelectNotification={onSelectNotification}
                  />
                )}
                renderSectionHeader={({ section: { title } }) => (
                  <View style={style.sectionView}>
                    <CustomText style={style.sectionHeader}>{title}</CustomText>
                  </View>
                )}
                ListFooterComponent={renderMoreLoader}
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
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  selectConversation: PropTypes.func,
  allNotifications: PropTypes.array.isRequired,
  isFetching: PropTypes.bool,
  isAllNotificationsLoaded: PropTypes.bool,
  getAllNotifications: PropTypes.func,
  markAllNotificationAsRead: PropTypes.func,
  unReadCount: PropTypes.number,
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

export default withStyles(NotificationScreen, styles);
