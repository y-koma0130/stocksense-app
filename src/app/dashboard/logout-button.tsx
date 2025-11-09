"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { css } from "../../../styled-system/css";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className={buttonStyle}>
      ログアウト
    </button>
  );
}

const buttonStyle = css({
  padding: "0.625rem 1.25rem",
  backgroundColor: "#2E2E2E",
  color: "#E5E5E5",
  fontSize: "0.875rem",
  fontWeight: "500",
  border: "1px solid #555",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "all 0.2s",
  _hover: {
    backgroundColor: "#3A3A3A",
    borderColor: "#666",
  },
});
