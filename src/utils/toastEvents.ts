// Message channel between showToast (used anywhere, including store code) and the glass toast
// on screen (GlassToastHost). Kept free of UI imports so store code and tests can use it.
export type ToastMessage = { id: number; text: string };

let nextId = 1;
const listeners = new Set<(toast: ToastMessage) => void>();

export const emitToast = (text: string) => {
  const toast = { id: nextId++, text };
  listeners.forEach(listener => listener(toast));
};

export const subscribeToToasts = (listener: (toast: ToastMessage) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
