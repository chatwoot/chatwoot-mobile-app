import customAttributeSlice, {
  actions as customAttributeActions,
  customAttributeSelector,
} from '../customAttributeSlice';

jest.mock('axios');

const customAttributes = [
  {
    id: 1,
    attribute_description: 'The date at which the account on app.chatwoot.com was created',
    attribute_display_name: 'Account Signup On',
    attribute_display_type: 'date',
    attribute_key: 'signedUpAt',
  },
  {
    id: 2,
    attribute_description: 'Cloud customer',
    attribute_display_name: 'Cloud Customer',
    attribute_display_type: 'boolean',
    attribute_key: 'cloudCustomer',
  },
];

jest.mock('helpers/APIHelper', () => {
  return {
    get: jest.fn(result => {
      return Promise.resolve({
        data: {
          payload: customAttributes,
        },
      });
    }),
  };
});

describe('customAttributeSlice', () => {
  describe('reducers', () => {
    const initialState = {
      entities: {},
      ids: [],
      loading: false,
    };

    it('sets loading true when getAllCustomAttributes is pending', () => {
      const action = { type: customAttributeActions.getAllCustomAttributes.pending };
      const state = customAttributeSlice(initialState, action);
      expect(state).toEqual({ loading: true, entities: {}, ids: [] });
    });

    it('sets loading false when getAllCustomAttributes is rejected', () => {
      const action = { type: customAttributeActions.getAllCustomAttributes.rejected };
      const state = customAttributeSlice(initialState, action);
      expect(state).toEqual({ loading: false, entities: {}, ids: [] });
    });

    it('sets loading false when getAllCustomAttributes is fulfilled', () => {
      const action = {
        type: customAttributeActions.getAllCustomAttributes.fulfilled,
        payload: customAttributes,
      };
      const state = customAttributeSlice(initialState, action);
      expect(state).toEqual({
        loading: false,
        entities: {
          1: {
            id: 1,
            attribute_description: 'The date at which the account on app.chatwoot.com was created',
            attribute_display_name: 'Account Signup On',
            attribute_display_type: 'date',
            attribute_key: 'signedUpAt',
          },
          2: {
            id: 2,
            attribute_description: 'Cloud customer',
            attribute_display_name: 'Cloud Customer',
            attribute_display_type: 'boolean',
            attribute_key: 'cloudCustomer',
          },
        },
        ids: [1, 2],
      });
    });
  });
  describe('selectors', () => {
    const state = {
      customAttributes: {
        entities: {
          1: customAttributes[0],
          2: customAttributes[1],
        },
        ids: [1, 2],
      },
    };

    it('returns customAttributes', () => {
      expect(customAttributeSelector.selectAll(state)).toEqual([
        customAttributes[0],
        customAttributes[1],
      ]);
    });
  });
});
