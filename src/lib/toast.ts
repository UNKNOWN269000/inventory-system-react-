// src/lib/toast.ts
// Lightweight shim so the component compiles without `sonner`.
// Swap the body of this file with the real `sonner` import later.

type ToastFn = (msg: string) => void;

const noop: ToastFn = () => {};

export const toast = {
  success: noop,
  error: noop,
  info: noop,
  warning: noop,
};
