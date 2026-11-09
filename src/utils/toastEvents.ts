// Kept UI-free for store code.
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
