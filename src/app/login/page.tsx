"use client";

import { LoginCard } from "@/features/auth/components/LoginCard";
import { css } from "../../../styled-system/css";

export default function LoginPage() {
  return (
    <div className={containerStyle}>
      <LoginCard />
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
