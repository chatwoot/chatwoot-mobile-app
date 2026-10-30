import type { Conversation } from '@/types';

export const commonLabels = (conversations: Pick<Conversation, 'labels'>[]): string[] => {
  if (!conversations.length) return [];
  return (conversations[0].labels || []).filter(label =>
    conversations.every(conversation => (conversation.labels || []).includes(label)),
  );
};

export const toggleLabel = (selected: string[], label: string) => {
  const isSelected = selected.includes(label);
  return {
    selected: isSelected ? selected.filter(item => item !== label) : [...selected, label],
    action: isSelected ? { remove: [label] } : { add: [label] },
  };
};
