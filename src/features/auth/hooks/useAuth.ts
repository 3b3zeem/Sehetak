"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "../services/auth.service";
import { LoginCredentials, RegisterCredentials } from "../types";

export function useRegister(locale: "en" | "ar", dict: any) {
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) =>
      authService.register(credentials),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(
          dict?.auth?.registerSuccess ||
            (locale === "ar"
              ? "تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول"
              : "Account created successfully! Please sign in"),
        );
        router.push(`/${locale}/login`);
      } else {
        toast.error(res.message || "Registration failed");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Registration error");
    },
  });
}

export function useLogin(locale: "en" | "ar", dict: any) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (res) => {
      if (res.success && res.data) {
        toast.success(dict?.auth?.loginSuccess || "Successfully logged in");
        queryClient.invalidateQueries({
          queryKey: ["authenticated-home-user"],
        });

        if (res.data.role === "admin") {
          router.push(`/${locale}/dashboard/admin`);
        } else {
          router.push(`/${locale}/dashboard/${res.data.username}`);
        }
      } else {
        toast.error(res.message || "Login failed");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Login error");
    },
  });
}

export function useGoogleAuth(locale: "en" | "ar") {
  return useMutation({
    mutationFn: () => authService.loginWithGoogle(locale),
    onError: (err: any) => {
      toast.error(err.message || "Google Auth error");
    },
  });
}
