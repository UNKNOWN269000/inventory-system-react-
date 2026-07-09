// src/lib/toast.ts
// Lightweight shim. Replace with real sonner later.
type ToastFn = (msg: string) => void;
const noop: ToastFn = () => {};
export const toast = {
  success: noop,
  error: noop,
  info: noop,
  warning: noop,
};
