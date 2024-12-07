import { HighIcon, MediumIcon, LowIcon, UrgentIcon } from '@/svg-icons/priority-icons';
import { ConversationPriority } from '@/types';

export const getPriorityIcon = (priority: ConversationPriority) => {
  switch (priority) {
    case 'high':
      return <HighIcon />;
    case 'medium':
      return <MediumIcon />;
    case 'low':
      return <LowIcon />;
    case 'urgent':
      return <UrgentIcon />;
    default:
      return null;
  }
};
