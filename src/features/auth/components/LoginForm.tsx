'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Pill } from 'lucide-react';

interface LoginFormProps {
  locale: 'en' | 'ar';
  dict: any;
}

export const LoginForm: React.FC<LoginFormProps> = ({ locale, dict }) => {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .single();

        const username = profile?.username || data.user.email?.split('@')[0] || 'patient';
        toast.success(dict.auth?.loginSuccess || 'Successfully logged in');
        router.push(`/${locale}/dashboard/${username}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?locale=${locale}`,
        },
      });
      if (error) {
        toast.error(error.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Google Sign-In error');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#008080] text-white flex items-center justify-center shadow-lg mb-3">
          <Pill className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{dict.auth?.welcomeBack}</h2>
        <p className="text-xs text-slate-500 mt-1">{dict.auth?.loginSubtitle}</p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Google OAuth Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full mb-4 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-3 transition-colors disabled:opacity-60"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{locale === 'ar' ? 'المتابعة باستخدام Google' : 'Continue with Google'}</span>
      </button>

      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-slate-200"></div>
        <span className="px-3 text-slate-400 text-xs">{locale === 'ar' ? 'أو' : 'OR'}</span>
        <div className="flex-1 border-t border-slate-200"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={dict.auth?.emailLabel}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
        />

        <Input
          label={dict.auth?.passwordLabel}
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
          {dict.auth?.submitLogin}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-600">
        <span>{dict.auth?.needAccount} </span>
        <Link href={`/${locale}/register`} className="font-bold text-[#008080] hover:underline">
          {dict.auth?.submitRegister}
        </Link>
      </div>
    </div>
  );
};
