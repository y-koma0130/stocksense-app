"use client";

import { Suspense } from "react";
import { LoginCard } from "@/features/auth/components/LoginCard";
import { css } from "../../../styled-system/css";

export default function LoginPage() {
  return (
    <div className={containerStyle}>
      <Suspense
        fallback={
          <div className={loadingStyle}>
            <p>読み込み中...</p>
          </div>
        }
      >
        <LoginCard />
      </Suspense>
    </div>
  );
}

const containerStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  width: "100%",
  backgroundColor: "background",
  padding: "1rem",
});

const loadingStyle = css({
  textAlign: "center",
  color: "text",
});
