"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LoginMessage = {
  type: "success" | "error";
  text: string;
};

type LoginStep = "email" | "otp";

type UseLoginParams = {
  lineUserId?: string | null;
};

export const useLogin = (params?: UseLoginParams) => {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<LoginStep>("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<LoginMessage | null>(null);
  const supabase = createClient();

  const sendOtp = async (emailAddress: string) => {
    setLoading(true);
    setMessage(null);

    try {
      // LINE連携がある場合はコールバックURLにlineUserIdを含める
      const redirectTo = params?.lineUserId
        ? `${window.location.origin}/auth/callback?lineUserId=${params.lineUserId}`
        : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email: emailAddress,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
        return false;
      }

      setMessage({
        type: "success",
        text: "認証コードをメールで送信しました。コードを入力してください。",
      });
      setStep("otp");
      return true;
    } catch {
      setMessage({
        type: "error",
        text: "エラーが発生しました。もう一度お試しください。",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (emailAddress: string, token: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: emailAddress,
        token,
        type: "email",
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
        return false;
      }

      return true;
    } catch {
      setMessage({
        type: "error",
        text: "認証に失敗しました。もう一度お試しください。",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetToEmail = () => {
    setStep("email");
    setOtpCode("");
    setMessage(null);
  };

  return {
    email,
    setEmail,
    otpCode,
    setOtpCode,
    step,
    loading,
    message,
    sendOtp,
    verifyOtp,
    resetToEmail,
  };
};
