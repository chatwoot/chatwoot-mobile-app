import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sheet } from '@/components-next/common/sheet/Sheet';
import i18n from '@/i18n';
import { useRefsContext } from '@/context';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { tailwind } from '@/theme';
import { NormalizedTemplate, TemplateSendParams } from '@/types';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { selectUserId, selectUserThumbnail } from '@/store/auth/authSelectors';
import { conversationActions } from '@/store/conversation/conversationActions';
import { filterTemplatesByQuery, getTemplatesForInbox } from '@/utils/messageTemplateUtils';

import WhatsAppTemplateItem from './WhatsAppTemplateItem';
import WhatsAppTemplateForm from './WhatsAppTemplateForm';
import TemplateSearchBar from './TemplateSearchBar';

type WhatsAppTemplatesListProps = {
  conversationId: number;
};

const LIST_BOTTOM_PADDING = 24;

const EmptyState = ({ label }: { label: string }) => (
  <Animated.View style={tailwind.style('flex-1 items-center justify-center px-6 pt-6')}>
    <Animated.Text
      style={tailwind.style(
        'text-md font-inter-420-20 tracking-[0.16px] text-gray-700 text-center',
      )}>
      {label}
    </Animated.Text>
  </Animated.View>
);

export const WhatsAppTemplatesList = ({ conversationId }: WhatsAppTemplatesListProps) => {
  const dispatch = useAppDispatch();
  const { bottom } = useSafeAreaInsets();
  const { whatsAppTemplatesSheetRef } = useRefsContext();
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

  const resetLocalState = () => {
    setSelectedTemplate(null);
    setSearchQuery('');
  };

  const handleClose = () => {
    resetLocalState();
    whatsAppTemplatesSheetRef.current?.dismiss();
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
      return <EmptyState label={i18n.t('CONTENT_TEMPLATE.NO_TEMPLATES')} />;
    }
    if (filteredTemplates.length === 0) {
      return <EmptyState label={i18n.t('CONTENT_TEMPLATE.NO_RESULTS')} />;
    }
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // The sheet reaches the screen edge, so the last row needs to clear the home indicator.
        contentContainerStyle={tailwind.style(`pb-[${LIST_BOTTOM_PADDING + bottom}px]`)}>
        {filteredTemplates.map((template, index) => (
          <WhatsAppTemplateItem
            key={`${template.platform}-${template.id}`}
            template={template}
            onPress={setSelectedTemplate}
            isLastItem={index === filteredTemplates.length - 1}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <Animated.View>
      <Sheet
        ref={whatsAppTemplatesSheetRef}
        detents={[0.85]}
        scrollable
        onDismiss={resetLocalState}>
        <Animated.View style={tailwind.style('flex-1 pt-4')}>
          {selectedTemplate ? (
            <WhatsAppTemplateForm
              template={selectedTemplate}
              onBack={() => setSelectedTemplate(null)}
              onSend={handleSend}
            />
          ) : (
            <Animated.View style={tailwind.style('flex-1')}>
              {templates.length > 0 && (
                <TemplateSearchBar value={searchQuery} onChangeText={setSearchQuery} />
              )}
              {renderListBody()}
            </Animated.View>
          )}
        </Animated.View>
      </Sheet>
    </Animated.View>
  );
};

export default WhatsAppTemplatesList;
