import t from 'tcomb-form-native';
import validator from 'validator';
// eslint-disable-next-line no-useless-escape
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const nameRegex = /^.{2}/;
const passwordRegex = /^.{6}/;
const mobileNumberValidator = (mobileNumber) => {
  const regex = /^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[789]\d{9}$/g;
  return regex.test(mobileNumber);
};
export const IndianMobileRegex = t.refinement(t.Number, mobileNumberValidator);

export const isStringEmail = (email) => {
  const re = emailRegex;
  return re.test(email);
};
export const Email = t.refinement(t.String, (email) => isStringEmail(email));

export const isStringName = (name) => {
  const re = nameRegex;
  return re.test(name);
};
export const Name = t.refinement(t.String, (name) => isStringName(name));

export const isStringUrl = (url) => {
  return validator.isURL(url);
};
export const URL = t.refinement(t.String, (url) => isStringUrl(url));

export const isStringPassword = (password) => {
  const re = passwordRegex;
  return re.test(password);
};
export const Password = t.refinement(t.String, (password) => isStringPassword(password));

export const isNumberValid = (number) => {
  const regex = /^\+?\d{1,8}(?:\.\d{1,2})?$/;
  return regex.test(number);
};
