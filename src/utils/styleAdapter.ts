import {
  Falsy,
  PressableStateCallbackType,
  RegisteredStyle,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

/**
 * "If the type of the value is a function, then return true, otherwise return false."
 *
 * The above function is a type guard. It's a function that takes a value and returns a boolean. If the
 * boolean is true, then the value is of the type that the type guard is guarding against
 * @param {any} value - any - The value to check.
 */

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const isFunction = (value: unknown): value is Function => typeof value === 'function';

/**
 * Take from Chakra UI Util Funcs
 * https://github.com/chakra-ui/chakra-ui/blob/05b19899b02e17b4ee16045c9e5065fa835f0159/packages/components/theme/src/utils/run-if-fn.ts
 *
 * "If the valueOrFn is a function, call it with the args and return the result, otherwise return the
 * valueOrFn."
 *
 * The function is generic, so it can be used with any type of valueOrFn and any number of args
 * @param {T | ((...fnArgs: U[]) => T)} valueOrFn - T | ((...fnArgs: U[]) => T)
 * @param {U[]} args - U[]
 * @returns A function that takes a value or a function and returns the value or the result of the
 * function.
 */
function runIfFn<T, U>(valueOrFn: T | ((...fnArgs: U[]) => T), ...args: U[]): T {
  return isFunction(valueOrFn) ? valueOrFn(...args) : valueOrFn;
}

export const styleAdapter = (
  style: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>),
  touchState?: PressableStateCallbackType,
): ViewStyle | Falsy | RegisteredStyle<ViewStyle> => {
  const _style = touchState ? runIfFn(style, touchState) : style;
  const __style = !Array.isArray(_style) ? _style : StyleSheet.flatten(_style);
  return __style as ViewStyle | Falsy | RegisteredStyle<ViewStyle>;
};
