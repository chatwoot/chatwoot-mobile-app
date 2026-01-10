import React from 'react';

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

  const handleLabelsUpdate = (updatedLabels: string[]) => {
    dispatch(
      contactLabelActions.updateContactLabels({
        contactId: contactId,
        labels: updatedLabels,
      }),
    );
  };

  return <LabelActions labels={labels} onLabelsUpdate={handleLabelsUpdate} />;
};

