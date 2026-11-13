import reducer, { selectRequiredConversationAttributes } from '../accountSlice';
import { accountActions } from '../accountActions';
import type { RootState } from '@/store';
import type { CustomAttribute } from '@/types';

const definition = (attributeKey: string, attributeModel = 'conversation_attribute') =>
  ({ id: attributeKey.length, attributeKey, attributeModel }) as CustomAttribute;

const stateWith = (features: Record<string, boolean>, conversationRequiredAttributes: string[]) => {
  const definitions = [
    definition('ticket_ref'),
    definition('order_value'),
    definition('ticket_ref', 'contact_attribute'),
  ];
  return {
    account: { features, conversationRequiredAttributes },
    customAttributes: {
      ids: definitions.map((_, index) => index),
      entities: Object.fromEntries(definitions.map((item, index) => [index, item])),
      isLoading: false,
    },
  } as unknown as RootState;
};

describe('accountSlice', () => {
  it('stores the fetched account details', () => {
    const state = reducer(undefined, {
      type: accountActions.show.fulfilled.type,
      payload: {
        features: { conversation_required_attributes: true },
        conversationRequiredAttributes: ['ticket_ref'],
      },
    });
    expect(state).toEqual({
      features: { conversation_required_attributes: true },
      conversationRequiredAttributes: ['ticket_ref'],
    });
  });

  it('returns the required conversation attribute definitions in order', () => {
    const state = stateWith({ conversation_required_attributes: true }, [
      'order_value',
      'deleted_key',
      'ticket_ref',
    ]);
    expect(
      selectRequiredConversationAttributes(state).map(item => [
        item.attributeKey,
        item.attributeModel,
      ]),
    ).toEqual([
      ['order_value', 'conversation_attribute'],
      ['ticket_ref', 'conversation_attribute'],
    ]);
  });

  it('requires nothing when the feature is off', () => {
    const state = stateWith({}, ['ticket_ref']);
    expect(selectRequiredConversationAttributes(state)).toEqual([]);
  });
});
