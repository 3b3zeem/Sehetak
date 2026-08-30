import { createClient } from "@/lib/supabase/client";
import { ApiResponse } from "@/types";
import { LoginCredentials, RegisterCredentials, AuthUserData } from "../types";

export const authService = {
  async register(
    credentials: RegisterCredentials,
  ): Promise<ApiResponse<AuthUserData>> {
    const supabase = createClient();
    const formattedUsername = credentials.username
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    // 1. Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.fullName,
          username: formattedUsername,
        },
      },
    });

    if (authError) {
      return { success: false, data: null, message: authError.message };
    }

    if (!authData.user) {
      return {
        success: false,
        data: null,
        message: "User registration failed",
      };
    }

    // 2. Insert user profile into profiles table
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      username: formattedUsername,
      full_name: credentials.fullName,
      email: credentials.email,
      role: "patient",
      locale: credentials.locale,
    });

    if (profileError) {
      return { success: false, data: null, message: profileError.message };
    }

    // 3. Sign out auto-created session so user lands on login page to sign in
    await supabase.auth.signOut();

    return {
      success: true,
      data: {
        id: authData.user.id,
        email: credentials.email,
        username: formattedUsername,
        role: "patient",
      },
      message: "Account created successfully",
    };
  },

  async login(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<AuthUserData>> {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { success: false, data: null, message: error.message };
    }

    if (!data.user) {
      return { success: false, data: null, message: "Authentication failed" };
    }

    // Fetch profile for role and username
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, role")
      .eq("id", data.user.id)
      .single();

    const role = (profile?.role as "admin" | "patient") || "patient";
    const username =
      profile?.username || data.user.email?.split("@")[0] || "patient";

    return {
      success: true,
      data: {
        id: data.user.id,
        email: data.user.email || "",
        username,
        role,
      },
      message: "Login successful",
    };
  },

  async loginWithGoogle(locale: "en" | "ar"): Promise<ApiResponse<null>> {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?locale=${locale}`,
      },
    });

    if (error) {
      return { success: false, data: null, message: error.message };
    }

    return { success: true, data: null, message: "OAuth initiated" };
  },
};
