"use client";

import { Suspense } from "react";
import { useAuthCallback } from "@/features/auth/hooks/useAuthCallback";
import { css } from "../../../../styled-system/css";

function AuthCallbackContent() {
  const { error } = useAuthCallback();

  return (
    <div className={containerStyle}>
      <p>{error ?? "認証中..."}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className={containerStyle}>
          <p>認証中...</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

const containerStyle = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
});
