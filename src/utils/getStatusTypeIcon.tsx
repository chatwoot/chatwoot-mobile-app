import React from 'react';

import { GridIcon, OpenIcon, PendingIcon, ResolvedIcon, SnoozedIcon } from '../svg-icons';
import { AllStatusTypes } from '../types';

export const getStatusTypeIcon = (type: AllStatusTypes) => {
  switch (type) {
    case 'all':
      return <GridIcon />;
    case 'open':
      return <OpenIcon />;
    case 'pending':
      return <PendingIcon />;
    case 'resolved':
      return <ResolvedIcon />;
    case 'snoozed':
      return <SnoozedIcon />;
  }
};
