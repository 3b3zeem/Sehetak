'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then(async (reg) => {
          const existingSub = await reg.pushManager.getSubscription();
          if (existingSub) {
            setIsSubscribed(true);
          }
        })
        .catch(console.error);
    }
  }, []);

  const subscribeToPush = async () => {
    if (!isSupported) {
      toast.error('Web Push is not supported in this browser');
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      toast.error('VAPID Public Key is missing from configuration');
      return;
    }

    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      });

      const json = await res.json();
      if (json.success) {
        setIsSubscribed(true);
        toast.success('Web Push Notifications active on this device!');
      } else {
        toast.error(json.message || 'Failed to subscribe');
      }
    } catch (err: any) {
      toast.error(err.message || 'Push registration failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    loading,
    subscribeToPush,
  };
}
