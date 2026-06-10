import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';

import { BottomSheetBackdrop, Icon } from '@/components-next';
import i18n from '@/i18n';
import { useRefsContext } from '@/context';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { tailwind } from '@/theme';
import { NormalizedTemplate, TemplateSendParams } from '@/types';
import { SearchIcon } from '@/svg-icons';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { selectUserId, selectUserThumbnail } from '@/store/auth/authSelectors';
import { conversationActions } from '@/store/conversation/conversationActions';
import { filterTemplatesByQuery, getTemplatesForInbox } from '@/utils/messageTemplateUtils';

import ContentTemplateItem from './ContentTemplateItem';
import ContentTemplateForm from './ContentTemplateForm';

type ContentTemplatesListProps = {
  conversationId: number;
};

export const ContentTemplatesList = ({ conversationId }: ContentTemplatesListProps) => {
  const dispatch = useAppDispatch();
  const { contentTemplatesSheetRef } = useRefsContext();
  const [selectedTemplate, setSelectedTemplate] = useState<NormalizedTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const inboxId = conversation?.inboxId;
  const inbox = useAppSelector(state => (inboxId ? selectInboxById(state, inboxId) : undefined));
  const userId = useAppSelector(selectUserId);
  const userThumbnail = useAppSelector(selectUserThumbnail);

  const templates = useMemo(() => getTemplatesForInbox(inbox), [inbox]);
  const filteredTemplates = useMemo(
    () => filterTemplatesByQuery(templates, searchQuery),
    [templates, searchQuery],
  );

  const handleDismiss = () => {
    setSelectedTemplate(null);
    setSearchQuery('');
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setSearchQuery('');
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

  const renderListBody = () => {
    if (templates.length === 0) {
      return (
        <Animated.View style={tailwind.style('flex-1 items-center justify-center px-6')}>
          <Animated.Text
            style={tailwind.style(
              'text-md font-inter-420-20 tracking-[0.16px] text-gray-700 text-center',
            )}>
            {i18n.t('CONTENT_TEMPLATE.NO_TEMPLATES')}
          </Animated.Text>
        </Animated.View>
      );
    }
    if (filteredTemplates.length === 0) {
      return (
        <Animated.View style={tailwind.style('flex-1 items-center justify-center px-6 pt-6')}>
          <Animated.Text
            style={tailwind.style(
              'text-md font-inter-420-20 tracking-[0.16px] text-gray-700 text-center',
            )}>
            {i18n.t('CONTENT_TEMPLATE.NO_RESULTS')}
          </Animated.Text>
        </Animated.View>
      );
    }
    return (
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tailwind.style('pb-6')}>
        {filteredTemplates.map((template, index) => (
          <ContentTemplateItem
            key={`${template.platform}-${template.id}`}
            template={template}
            onPress={setSelectedTemplate}
            isLastItem={index === filteredTemplates.length - 1}
          />
        ))}
      </BottomSheetScrollView>
    );
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
        snapPoints={['85%']}
        enableDynamicSizing={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore">
        <Animated.View style={tailwind.style('flex-1 pt-4')}>
          {selectedTemplate ? (
            <ContentTemplateForm
              template={selectedTemplate}
              onBack={() => setSelectedTemplate(null)}
              onSend={handleSend}
            />
          ) : (
            <Animated.View style={tailwind.style('flex-1')}>
              {templates.length > 0 && (
                <View style={tailwind.style('px-3 pb-1')}>
                  <View
                    style={tailwind.style(
                      'h-9 flex-row items-center gap-[6px] px-[10px] rounded-[11px] bg-blackA-A3',
                    )}>
                    <Icon icon={<SearchIcon />} size={18} />
                    <BottomSheetTextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder={i18n.t('CONTENT_TEMPLATE.SEARCH_PLACEHOLDER')}
                      placeholderTextColor={tailwind.color('text-gray-600')}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={tailwind.style(
                        'flex-1 text-base font-inter-420-20 tracking-[0.24px] text-gray-950 p-0',
                      )}
                    />
                  </View>
                </View>
              )}
              {renderListBody()}
            </Animated.View>
          )}
        </Animated.View>
      </BottomSheetModal>
    </Animated.View>
  );
};

export default ContentTemplatesList;
