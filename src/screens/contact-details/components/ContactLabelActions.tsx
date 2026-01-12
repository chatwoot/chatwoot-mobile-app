import React, { useRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { useAppDispatch } from '@/hooks';
import { contactLabelActions } from '@/store/contact/contactLabelActions';

import { LabelActions } from '@/components-next/label-section';

interface ContactLabelActionsProps {
  labels: string[];
  contactId: number;
}

export const ContactLabelActions = (props: ContactLabelActionsProps) => {
  const { labels, contactId } = props;
  const dispatch = useAppDispatch();
  const contactLabelSheetRef = useRef<BottomSheetModal>(null);

  const handleLabelsUpdate = (updatedLabels: string[]) => {
    dispatch(
      contactLabelActions.updateContactLabels({
        contactId: contactId,
        labels: updatedLabels,
      }),
    );
  };

  return (
    <LabelActions
      labels={labels}
      onLabelsUpdate={handleLabelsUpdate}
      sheetRef={contactLabelSheetRef}
    />
  );
};

