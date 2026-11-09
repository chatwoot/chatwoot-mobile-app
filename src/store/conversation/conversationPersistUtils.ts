import * as Sentry from '@sentry/react-native';

interface PersistedConversations {
  ids?: unknown[];
  entities?: Record<string, unknown>;
}

const describeId = (id: unknown) => (id === null ? 'null' : typeof id);

/**
 * Drops persisted conversation ids that have no stored conversation. The entity
 * adapter's `selectAll` returns `undefined` for such an id, and every selector
 * reading conversations at launch would throw on it.
 */
export const repairPersistedConversations = <T extends { conversations?: PersistedConversations }>(
  state: T,
): T => {
  const { ids, entities } = state?.conversations ?? {};
  if (!Array.isArray(ids) || !entities) {
    return state;
  }

  const missingIds = ids.filter(id => !entities[String(id)]);
  if (!missingIds.length) {
    return state;
  }

  Sentry.captureMessage('Persisted conversation ids without a conversation', {
    extra: {
      ids: ids.length,
      missing: missingIds.length,
      missingIdTypes: [...new Set(missingIds.map(describeId))],
    },
  });

  return {
    ...state,
    conversations: {
      ...state.conversations,
      ids: ids.filter(id => !missingIds.includes(id)),
    },
  };
};
