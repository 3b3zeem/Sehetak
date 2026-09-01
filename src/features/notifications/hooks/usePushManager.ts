'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const syncSubscriptionWithServer = useCallback(async (sub: PushSubscription) => {
    try {
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      });
      const json = await res.json();
      return json.success;
    } catch (err) {
      console.error('Error syncing push subscription:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      navigator.serviceWorker
        .register('/sw.js')
        .then(async (reg) => {
          const existingSub = await reg.pushManager.getSubscription();
          if (existingSub) {
            setIsSubscribed(true);
            // Automatically ensure existing subscription is persisted to database for logged in user
            await syncSubscriptionWithServer(existingSub);
          }
        })
        .catch(console.error);
    }
  }, [syncSubscriptionWithServer]);

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
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
      }

      const success = await syncSubscriptionWithServer(sub);

      if (success) {
        setIsSubscribed(true);
        toast.success('تم تفعيل إشعارات المتصفح وتأكيد ربطها بحسابك بنجاح 🔔');
      } else {
        toast.error('فشل حفظ اشتراك الإشعارات في قاعدة البيانات. الرجاء التأكد من تسجيل الدخول.');
      }
    } catch (err: any) {
      toast.error(err.message || 'فشل تفعيل إشعارات المتصفح');
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
