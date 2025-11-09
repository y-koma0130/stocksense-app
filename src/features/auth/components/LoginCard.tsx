"use client";

import Image from "next/image";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { css } from "../../../../styled-system/css";
import { useLogin } from "../hooks/useLogin";

export function LoginCard() {
  const { email, setEmail, loading, message, login } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email);
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

      <form onSubmit={handleSubmit} className={formStyle}>
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
          {loading ? "送信中..." : "ログイン"}
        </Button>
      </form>
    </Card>
  );
}

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
