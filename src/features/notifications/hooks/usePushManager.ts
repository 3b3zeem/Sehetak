'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function usePushManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      // Register service worker
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  const subscribeToPush = async () => {
    if (!isSupported) {
      toast.error('Web Push is not supported in this browser');
      return;
    }

    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
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
