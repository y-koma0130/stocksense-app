"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { css } from "../../../../styled-system/css";
import { useLogin } from "../hooks/useLogin";

export const LoginCard = () => {
  const router = useRouter();
  const {
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
  } = useLogin();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOtp(email);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyOtp(email, otpCode);
    if (success) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <Card className={cardWrapperStyle}>
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

      {step === "email" ? (
        <form onSubmit={handleSendOtp} className={formStyle}>
          {message && <Alert variant={message.type}>{message.text}</Alert>}

          <Input
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={loading}
          />

          <Button type="submit" disabled={loading} variant="primary">
            {loading ? "送信中..." : "認証コードを送信"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className={formStyle}>
          {message && <Alert variant={message.type}>{message.text}</Alert>}

          <p className={emailDisplayStyle}>{email}</p>

          <Input
            label="認証コード"
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="12345678"
            required
            disabled={loading}
            maxLength={8}
            pattern="[0-9]{6,8}"
            inputMode="numeric"
          />

          <Button type="submit" disabled={loading || otpCode.length < 6} variant="primary">
            {loading ? "認証中..." : "ログイン"}
          </Button>

          <button type="button" onClick={resetToEmail} className={backLinkStyle}>
            別のメールアドレスを使用
          </button>
        </form>
      )}
    </Card>
  );
};

const cardWrapperStyle = css({
  maxWidth: "420px",
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
  color: "text",
  opacity: 0.8,
});

const formStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

const emailDisplayStyle = css({
  fontSize: "0.95rem",
  color: "text",
  textAlign: "center",
  padding: "0.75rem",
  backgroundColor: "surfaceHover",
  borderRadius: "0.5rem",
});

const backLinkStyle = css({
  fontSize: "0.875rem",
  color: "primary",
  textAlign: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  textDecoration: "underline",
  _hover: {
    opacity: 0.8,
  },
});
