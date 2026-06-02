import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { BottomSheetBackdrop } from '@/components-next';
import i18n from '@/i18n';
import { useRefsContext } from '@/context';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { tailwind } from '@/theme';
import { NormalizedTemplate, TemplateSendParams } from '@/types';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { selectUserId, selectUserThumbnail } from '@/store/auth/authSelectors';
import { conversationActions } from '@/store/conversation/conversationActions';
import { getTemplatesForInbox } from '@/utils/messageTemplateUtils';

import ContentTemplateItem from './ContentTemplateItem';
import ContentTemplateForm from './ContentTemplateForm';

type ContentTemplatesListProps = {
  conversationId: number;
};

export const ContentTemplatesList = ({ conversationId }: ContentTemplatesListProps) => {
  const dispatch = useAppDispatch();
  const { contentTemplatesSheetRef } = useRefsContext();
  const [selectedTemplate, setSelectedTemplate] = useState<NormalizedTemplate | null>(null);

  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const inboxId = conversation?.inboxId;
  const inbox = useAppSelector(state => (inboxId ? selectInboxById(state, inboxId) : undefined));
  const userId = useAppSelector(selectUserId);
  const userThumbnail = useAppSelector(selectUserThumbnail);

  const templates = useMemo(() => getTemplatesForInbox(inbox), [inbox]);

  const handleDismiss = () => {
    setSelectedTemplate(null);
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    contentTemplatesSheetRef.current?.dismiss({ overshootClamping: true });
  };

  const handleSend = ({
    message,
    templateParams,
  }: {
    message: string;
    templateParams: TemplateSendParams;
  }) => {
    dispatch(
      conversationActions.sendMessage({
        conversationId,
        message,
        private: false,
        templateParams,
        sender: {
          id: userId ?? 0,
          thumbnail: userThumbnail ?? '',
        },
      }),
    );
    handleClose();
  };

  return (
    <Animated.View>
      <BottomSheetModal
        ref={contentTemplatesSheetRef}
        backdropComponent={BottomSheetBackdrop}
        onDismiss={handleDismiss}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-t-[26px] overflow-hidden')}
        enablePanDownToClose
        snapPoints={['75%']}
        enableDynamicSizing={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore">
        <Animated.View style={tailwind.style('flex-1')}>
          {selectedTemplate ? (
            <ContentTemplateForm
              template={selectedTemplate}
              onBack={() => setSelectedTemplate(null)}
              onSend={handleSend}
            />
          ) : (
            <Animated.View style={tailwind.style('flex-1')}>
              <View style={tailwind.style('px-4 pt-1 pb-4 items-center')}>
                <Animated.Text
                  style={tailwind.style(
                    'text-md font-inter-medium-24 tracking-[0.3px] text-gray-700',
                  )}>
                  {i18n.t('CONTENT_TEMPLATE.SELECT_TEMPLATE')}
                </Animated.Text>
              </View>
              {templates.length === 0 ? (
                <Animated.View style={tailwind.style('flex-1 items-center justify-center px-6')}>
                  <Animated.Text
                    style={tailwind.style(
                      'text-md font-inter-420-20 tracking-[0.16px] text-gray-700 text-center',
                    )}>
                    {i18n.t('CONTENT_TEMPLATE.NO_TEMPLATES')}
                  </Animated.Text>
                </Animated.View>
              ) : (
                <BottomSheetScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={tailwind.style('pb-6')}>
                  {templates.map((template, index) => (
                    <ContentTemplateItem
                      key={`${template.platform}-${template.id}`}
                      template={template}
                      onPress={setSelectedTemplate}
                      isLastItem={index === templates.length - 1}
                    />
                  ))}
                </BottomSheetScrollView>
              )}
            </Animated.View>
          )}
        </Animated.View>
      </BottomSheetModal>
    </Animated.View>
  );
};

export default ContentTemplatesList;
