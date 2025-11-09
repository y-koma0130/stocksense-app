"use client";

import { useState } from "react";
import Image from "next/image";
import { css } from "../../../styled-system/css";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "メールを確認してください。ログインリンクを送信しました。",
        });
        setEmail("");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "エラーが発生しました。もう一度お試しください。",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={containerStyle}>
      <div className={cardStyle}>
        <div className={headerStyle}>
          <div className={logoContainerStyle}>
            <Image
              src="/Logo.svg"
              alt="StockSense Logo"
              width={200}
              height={60}
              priority
              className={logoStyle}
            />
          </div>
          <p className={subtitleStyle}>AIが見つける、買い時の銘柄</p>
        </div>

        <form onSubmit={handleLogin} className={formStyle}>
          {message && (
            <div
              className={
                message.type === "success"
                  ? successMessageStyle
                  : errorMessageStyle
              }
            >
              {message.text}
            </div>
          )}

          <div className={inputGroupStyle}>
            <label htmlFor="email" className={labelStyle}>
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              className={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} className={buttonStyle}>
            {loading ? "送信中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}

const containerStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  width: "100%",
  backgroundColor: "#434343",
  padding: "1rem",
});

const cardStyle = css({
  backgroundColor: "#2E2E2E",
  borderRadius: "12px",
  padding: "2.5rem",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
});

const headerStyle = css({
  textAlign: "center",
  marginBottom: "2rem",
});

const logoContainerStyle = css({
  display: "flex",
  justifyContent: "center",
  marginBottom: "1rem",
});

const logoStyle = css({
  width: "200px",
  height: "auto",
  maxWidth: "100%",
  objectFit: "contain",
});

const subtitleStyle = css({
  fontSize: "0.95rem",
  color: "#E5E5E5",
  opacity: 0.8,
});

const formStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

const inputGroupStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

const labelStyle = css({
  fontSize: "0.875rem",
  fontWeight: "500",
  color: "#E5E5E5",
});

const inputStyle = css({
  padding: "0.75rem 1rem",
  backgroundColor: "#434343",
  border: "1px solid #555",
  borderRadius: "6px",
  color: "#E5E5E5",
  fontSize: "1rem",
  outline: "none",
  transition: "border-color 0.2s",
  _placeholder: {
    color: "#999",
  },
  _focus: {
    borderColor: "#E9F355",
  },
});

const buttonStyle = css({
  padding: "0.875rem",
  backgroundColor: "#E9F355",
  color: "#2E2E2E",
  fontSize: "1rem",
  fontWeight: "600",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "all 0.2s",
  _hover: {
    backgroundColor: "#F5FF7A",
    transform: "translateY(-1px)",
  },
  _active: {
    transform: "translateY(0)",
  },
  _disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    transform: "none",
  },
});

const successMessageStyle = css({
  padding: "0.75rem",
  backgroundColor: "#2E5C2E",
  color: "#9AE69A",
  borderRadius: "6px",
  fontSize: "0.875rem",
  textAlign: "center",
});

const errorMessageStyle = css({
  padding: "0.75rem",
  backgroundColor: "#5C2E2E",
  color: "#E69A9A",
  borderRadius: "6px",
  fontSize: "0.875rem",
  textAlign: "center",
});
