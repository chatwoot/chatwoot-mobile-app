import { configureStore } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react-native';
import conversationReducer, { addConversation } from '../conversationSlice';
import { conversationActions } from '../conversationActions';
import { conversationListenerMiddleware } from '../conversationListener';
import { conversation } from './conversationMockData';
import { transformConversation } from '@/utils/camelCaseKeys';

jest.mock('@sentry/react-native', () => ({ captureMessage: jest.fn() }));

const buildStore = () =>
  configureStore({
    reducer: {
      conversations: conversationReducer,
      settings: () => ({ version: '4.7.0' }),
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ serializableCheck: false }).prepend(
        conversationListenerMiddleware.middleware,
      ),
  });

describe('conversation listener', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reports a conversation without an id with its source action', () => {
    const store = buildStore();
    store.dispatch(
      conversationActions.fetchConversation.fulfilled(
        { conversation: transformConversation('<!DOCTYPE html>') },
        'request-id',
        1,
      ),
    );

    expect(Sentry.captureMessage).toHaveBeenCalledWith('Conversation without an id', {
      extra: {
        action: 'conversations/fetchConversation/fulfilled',
        count: 1,
        payloadType: 'object',
        keys: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        serverVersion: '4.7.0',
      },
    });
  });

  it('does not report conversations that have an id', () => {
    const store = buildStore();
    store.dispatch(addConversation(conversation));

    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });
});
