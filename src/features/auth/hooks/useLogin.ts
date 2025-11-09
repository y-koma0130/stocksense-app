"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface LoginMessage {
  type: "success" | "error";
  text: string;
}

export function useLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<LoginMessage | null>(null);
  const supabase = createClient();

  const login = async (emailAddress: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailAddress,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
        return false;
      }

      setMessage({
        type: "success",
        text: "メールを確認してください。ログインリンクを送信しました。",
      });
      setEmail("");
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

  return {
    email,
    setEmail,
    loading,
    message,
    login,
  };
}
