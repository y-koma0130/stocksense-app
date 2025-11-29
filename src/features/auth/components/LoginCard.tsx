"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { css } from "../../../../styled-system/css";
import { trpc } from "../../../../trpc/client";
import { useLogin } from "../hooks/useLogin";

export const LoginCard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lineUserId = searchParams.get("lineUserId");

  const linkLineAccountMutation = trpc.lineNotification.linkLineAccount.useMutation();
  const initializeSubscriptionMutation = trpc.userSubscription.initialize.useMutation();

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
  } = useLogin({ lineUserId });

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOtp(email);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyOtp(email, otpCode);
    if (success) {
      // サブスクリプションを初期化（新規ユーザーはfreeプランで登録、既存ユーザーは何もしない）
      try {
        await initializeSubscriptionMutation.mutateAsync();
      } catch {
        // 初期化失敗してもログインは継続
      }

      // LINE連携がある場合は自動紐付け
      if (lineUserId) {
        try {
          await linkLineAccountMutation.mutateAsync({ lineUserId });
        } catch {
          // LINE連携失敗してもログインは継続
        }
      }
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
        {lineUserId && (
          <div className={lineNoticeStyle}>
            <span className={lineIconStyle}>LINE</span>
            <span>LINE連携モード</span>
          </div>
        )}
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

const lineNoticeStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  marginTop: "1rem",
  padding: "0.75rem 1rem",
  backgroundColor: "rgba(6, 199, 85, 0.1)",
  borderRadius: "8px",
  fontSize: "0.875rem",
  fontWeight: "600",
  color: "#06c755",
});

const lineIconStyle = css({
  padding: "0.25rem 0.5rem",
  backgroundColor: "#06c755",
  color: "white",
  borderRadius: "4px",
  fontSize: "0.75rem",
  fontWeight: "700",
});
