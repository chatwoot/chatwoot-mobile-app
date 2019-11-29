const initialState = {
  value: 'en',
  isLocaleSet: false,
};
export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_LOCALE':
      return {
        ...state,
        value: action.payload,
        isLocaleSet: true,
      };

    default:
      return state;
  }
};
