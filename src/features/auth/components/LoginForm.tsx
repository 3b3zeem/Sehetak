"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useLogin, useGoogleAuth } from "../hooks/useAuth";

interface LoginFormProps {
  locale: "en" | "ar";
  dict: any;
}

export const LoginForm: React.FC<LoginFormProps> = ({ locale, dict }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin(locale, dict);
  const googleAuthMutation = useGoogleAuth(locale);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
      <div className="flex flex-col items-center text-center mb-6">
        <Image
          src="/icon.svg"
          alt="sehetak"
          width={64}
          height={64}
          className="w-16 h-16 object-contain mb-3"
          priority
          draggable={false}
        />
        <h2 className="text-2xl font-bold text-slate-900">
          {dict.auth?.welcomeBack}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {dict.auth?.loginSubtitle}
        </p>
      </div>

      {loginMutation.isError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {(loginMutation.error as any)?.message || "Login failed"}
        </div>
      )}

      {/* Google OAuth Login Button */}
      <button
        type="button"
        onClick={() => googleAuthMutation.mutate()}
        disabled={googleAuthMutation.isPending || loginMutation.isPending}
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
        <span>
          {locale === "ar"
            ? "المتابعة باستخدام Google"
            : "Continue with Google"}
        </span>
      </button>

      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-slate-200"></div>
        <span className="px-3 text-slate-400 text-xs">
          {locale === "ar" ? "أو" : "OR"}
        </span>
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

        <div className="flex justify-end pt-0.5">
          <Link
            href={`/${locale}/forgot-password`}
            className="text-xs font-semibold text-[#008080] hover:underline"
          >
            {dict.auth?.forgotPassword || (locale === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?")}
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={loginMutation.isPending}
        >
          {dict.auth?.submitLogin}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-600">
        <span>{dict.auth?.needAccount} </span>
        <Link
          href={`/${locale}/register`}
          className="font-bold text-[#008080] hover:underline"
        >
          {dict.auth?.submitRegister}
        </Link>
      </div>
    </div>
  );
};
