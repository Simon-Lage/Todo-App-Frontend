import type { ToastOptions } from '@ionic/react';

export const TOAST_EVENT_NAME = 'todoapp:toast';

type ToastPayload = ToastOptions & {
  message: string;
};

const present = (payload: ToastPayload): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT_NAME, { detail: payload }));
};

const success = (message: string, options: Omit<ToastPayload, 'message'> = {}): void => {
  present({ message, color: 'success', duration: 2200, position: 'top', ...options });
};

const error = (message: string, options: Omit<ToastPayload, 'message'> = {}): void => {
  present({ message, color: 'danger', duration: 2800, position: 'top', ...options });
};

export const toastService = {
  present,
  success,
  error,
};

