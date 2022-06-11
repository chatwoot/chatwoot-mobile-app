import axios from '../helpers/APIHelper';

import {
  GET_ALL_CUSTOM_ATTRIBUTES,
  GET_ALL_CUSTOM_ATTRIBUTES_SUCCESS,
  GET_ALL_CUSTOM_ATTRIBUTES_ERROR,
} from '../constants/actions';

export const getAllCustomAttributes = () => async dispatch => {
  dispatch({ type: GET_ALL_CUSTOM_ATTRIBUTES });
  try {
    const apiUrl = 'custom_attribute_definitions';
    const response = await axios.get(apiUrl);
    const { data } = response;
    dispatch({
      type: GET_ALL_CUSTOM_ATTRIBUTES_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({ type: GET_ALL_CUSTOM_ATTRIBUTES_ERROR, payload: error });
  }
};
