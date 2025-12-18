import React, { useEffect } from 'react';
import { useIonToast } from '@ionic/react';
import type { ToastOptions } from '@ionic/react';
import { TOAST_EVENT_NAME } from '../services/toastService';

type ToastPayload = ToastOptions & { message: string };

const ToastHost: React.FC = () => {
  const [present] = useIonToast();

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<ToastPayload>;
      const payload = custom.detail;
      if (!payload?.message) return;
      void present(payload);
    };

    window.addEventListener(TOAST_EVENT_NAME, handler);
    return () => window.removeEventListener(TOAST_EVENT_NAME, handler);
  }, [present]);

  return null;
};

export default ToastHost;

