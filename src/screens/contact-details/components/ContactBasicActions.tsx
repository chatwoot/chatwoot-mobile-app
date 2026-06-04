import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Linking, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { Icon } from '@/components-next';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { ContactableInboxSelectorSheet } from '@/screens/common/ContactableInboxSelectorSheet';
import { VoiceInboxSelectorSheet } from '@/screens/common/VoiceInboxSelectorSheet';
import { selectUserId } from '@/store/auth/authSelectors';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { conversationActions } from '@/store/conversation/conversationActions';
import { contactActions } from '@/store/contact/contactActions';
import { ContactService } from '@/store/contact/contactService';
import type { ContactableInbox } from '@/store/contact/contactTypes';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { ChatIcon, MailIcon, Overflow, PhoneIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import type { Inbox } from '@/types/Inbox';
import { useHaptic, useScaleAnimation } from '@/utils';
import { isVoiceCallEnabled } from '@/utils/inboxUtils';
import { openEmail, openNumber } from '@/utils/urlUtils';
import { showToast } from '@/utils/toastUtils';
import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';

type ContactActionIntent = 'call' | 'message' | 'email';

type ContactOption = {
  contactType: string;
  icon: React.ReactNode;
  disabled?: boolean;
};

type ContactOptionProps = {
  option: ContactOption;
  handleOptionPress?: () => void;
};

const SCREEN_WIDTH = Dimensions.get('screen').width;
const OPTION_WIDTH = (SCREEN_WIDTH - 32 - 12 * 3) / 4;

const ContactOptionComponent = (props: ContactOptionProps) => {
  const { option, handleOptionPress } = props;

  const { handlers, animatedStyle } = useScaleAnimation();
  const hapticSelection = useHaptic();

  const handleOnPress = () => {
    if (option.disabled) {
      return;
    }

    hapticSelection?.();
    handleOptionPress?.();
  };

  return (
    <Animated.View style={[tailwind.style('flex-1'), animatedStyle]}>
      <Pressable
        style={({ pressed }) => [
          tailwind.style(
            'flex items-center justify-center flex-1 rounded-xl bg-gray-50 py-3',
            `w-[${OPTION_WIDTH}px]`,
            pressed ? 'bg-gray-100' : '',
          ),
        ]}
        onPress={handleOnPress}
        disabled={option.disabled}
        {...handlers}>
        <Icon icon={option.icon} size={24} />
        <Animated.Text
          numberOfLines={1}
          style={tailwind.style(
            'text-cxs font-inter-medium-24 leading-[15px] tracking-[0.32px] text-center text-blue-800 pt-2',
            option.disabled ? 'text-gray-700' : '',
          )}>
          {option.contactType}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};

type ContactBasicActionsProps = {
  phoneNumber?: string;
  email?: string;
};

export const ContactBasicActions = (props: ContactBasicActionsProps) => {
  const { phoneNumber, email } = props;
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<TabBarExcludedScreenParamList, 'ContactDetails'>>();
  const { conversationId, contactId: routeContactId } = route.params;
  const currentUserId = useAppSelector(selectUserId);
  const conversation = useAppSelector(state =>
    conversationId ? selectConversationById(state, conversationId) : null,
  );
  const contactId = routeContactId || conversation?.meta?.sender?.id;
  const inboxes = useAppSelector(selectAllInboxes);
  const [voiceSelectorVisible, setVoiceSelectorVisible] = useState(false);
  const [contactableSelectorVisible, setContactableSelectorVisible] = useState(false);
  const [availableContactableInboxes, setAvailableContactableInboxes] = useState<
    ContactableInbox[]
  >([]);
  const [contactableInboxes, setContactableInboxes] = useState<ContactableInbox[]>([]);
  const [hasLoadedContactableInboxes, setHasLoadedContactableInboxes] = useState(false);
  const [isLoadingContactableInboxes, setIsLoadingContactableInboxes] = useState(false);

  const voiceInboxes = useMemo(() => inboxes.filter(isVoiceCallEnabled), [inboxes]);

  const startCall = (inbox: Inbox) => {
    if (!contactId) {
      if (phoneNumber) {
        openNumber({ phoneNumber });
      }
      return;
    }

    dispatch(contactActions.startContactCall({ contactId, inboxId: inbox.id, conversationId }));
  };

  const openSystemContactAction = (intent: ContactActionIntent) => {
    if (intent === 'call' && phoneNumber) {
      openNumber({ phoneNumber });
    }

    if (intent === 'message' && phoneNumber) {
      Linking.openURL(`sms:${phoneNumber}`);
    }

    if (intent === 'email' && email) {
      openEmail({ email });
    }
  };

  const filterContactableInboxes = (payload: ContactableInbox[], intent: ContactActionIntent) => {
    if (intent === 'email') {
      return payload.filter(inbox => inbox.channelType === 'Channel::Email');
    }

    if (intent === 'message') {
      return payload.filter(inbox => inbox.channelType !== 'Channel::Email');
    }

    return payload;
  };

  const enrichContactableInboxes = (payload: ContactableInbox[]) => {
    return payload.map(contactableInbox => {
      const cachedInbox = inboxes.find(inbox => inbox.id === contactableInbox.id);

      if (!cachedInbox) {
        return contactableInbox;
      }

      return {
        ...cachedInbox,
        ...contactableInbox,
        avatarUrl: contactableInbox.avatarUrl || cachedInbox.avatarUrl,
        channelId: contactableInbox.channelId || cachedInbox.channelId,
        channelType: contactableInbox.channelType || cachedInbox.channelType,
        email: contactableInbox.email || cachedInbox.email,
        medium: contactableInbox.medium || cachedInbox.medium,
        phoneNumber: contactableInbox.phoneNumber || cachedInbox.phoneNumber,
        provider: contactableInbox.provider || cachedInbox.provider,
        additionalAttributes: {
          ...(cachedInbox.additionalAttributes || {}),
          ...(contactableInbox.additionalAttributes || {}),
        },
      };
    });
  };

  const loadContactableInboxes = useCallback(async () => {
    if (!contactId) {
      return [];
    }

    const response = await ContactService.getContactableInboxes(contactId);
    const enrichedInboxes = enrichContactableInboxes(response.payload);
    setAvailableContactableInboxes(enrichedInboxes);
    setHasLoadedContactableInboxes(true);
    return enrichedInboxes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId, inboxes]);

  useEffect(() => {
    if (!contactId) {
      setAvailableContactableInboxes([]);
      setHasLoadedContactableInboxes(false);
      return;
    }

    let isMounted = true;

    ContactService.getContactableInboxes(contactId)
      .then(response => {
        if (!isMounted) {
          return;
        }

        setAvailableContactableInboxes(enrichContactableInboxes(response.payload));
        setHasLoadedContactableInboxes(true);
      })
      .catch(() => {
        if (isMounted) {
          setHasLoadedContactableInboxes(true);
        }
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId, inboxes]);

  const messageContactableInboxes = useMemo(
    () => filterContactableInboxes(availableContactableInboxes, 'message'),
    [availableContactableInboxes],
  );

  const openContactableInboxSelector = async (intent: ContactActionIntent) => {
    if (!contactId) {
      openSystemContactAction(intent);
      return;
    }

    setContactableSelectorVisible(true);
    setIsLoadingContactableInboxes(!hasLoadedContactableInboxes);
    try {
      const contactableInboxPayload = hasLoadedContactableInboxes
        ? availableContactableInboxes
        : await loadContactableInboxes();
      setContactableInboxes(filterContactableInboxes(contactableInboxPayload, intent));
    } catch {
      setContactableSelectorVisible(false);
    } finally {
      setIsLoadingContactableInboxes(false);
    }
  };

  const openConversationForInbox = async (inbox: ContactableInbox) => {
    if (!contactId) {
      return;
    }

    try {
      const response = await dispatch(
        conversationActions.createConversation({
          contactId,
          inboxId: inbox.id,
          sourceId: inbox.sourceId,
          assigneeId: currentUserId,
        }),
      ).unwrap();
      setContactableSelectorVisible(false);
      navigation.dispatch(
        StackActions.replace('ChatScreen', {
          conversationId: response.conversation.id,
        }),
      );
    } catch {
      showToast({ message: i18n.t('CONTACT_DETAILS.OPEN_CONVERSATION_FAILED') });
    }
  };

  const onCallPress = () => {
    if (!voiceInboxes.length) {
      setVoiceSelectorVisible(true);
      return;
    }

    if (voiceInboxes.length === 1) {
      startCall(voiceInboxes[0]);
      return;
    }

    setVoiceSelectorVisible(true);
  };

  const activeIconColor = tailwind.color('bg-blue-800');
  const disabledIconColor = tailwind.color('text-gray-700');
  const hasMessageAction =
    !!phoneNumber ||
    !!email ||
    (!isLoadingContactableInboxes && messageContactableInboxes.length > 0);

  const options: ContactOption[] = [
    {
      contactType: i18n.t('CONTACT_DETAILS.CALL'),
      icon: (
        <PhoneIcon strokeWidth={2} stroke={phoneNumber ? activeIconColor : disabledIconColor} />
      ),
      disabled: !phoneNumber,
    },
    {
      contactType: i18n.t('CONTACT_DETAILS.MESSAGE'),
      icon: (
        <ChatIcon strokeWidth={2} stroke={hasMessageAction ? activeIconColor : disabledIconColor} />
      ),
      disabled: !hasMessageAction,
    },
    {
      contactType: i18n.t('CONTACT_DETAILS.EMAIL'),
      icon: <MailIcon strokeWidth={2} stroke={email ? activeIconColor : disabledIconColor} />,
      disabled: !email,
    },
    {
      contactType: i18n.t('CONTACT_DETAILS.MORE'),
      icon: <Overflow strokeWidth={2} stroke={tailwind.color('bg-blue-800')} />,
    },
  ];

  return (
    <>
      <Animated.View style={tailwind.style('flex flex-row justify-between ')}>
        <ContactOptionComponent key="call" option={options[0]} handleOptionPress={onCallPress} />
        <ContactOptionComponent
          key="message"
          option={options[1]}
          handleOptionPress={() => openContactableInboxSelector('message')}
        />
        <ContactOptionComponent
          key="email"
          option={options[2]}
          handleOptionPress={() => openContactableInboxSelector('email')}
        />
        <ContactOptionComponent key="more" option={options[3]} />
      </Animated.View>
      <VoiceInboxSelectorSheet
        visible={voiceSelectorVisible}
        inboxes={voiceInboxes}
        onSelect={startCall}
        onClose={() => setVoiceSelectorVisible(false)}
      />
      <ContactableInboxSelectorSheet
        visible={contactableSelectorVisible}
        inboxes={contactableInboxes}
        isLoading={isLoadingContactableInboxes}
        onSelect={openConversationForInbox}
        onClose={() => setContactableSelectorVisible(false)}
      />
    </>
  );
};
