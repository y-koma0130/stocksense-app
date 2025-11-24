"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { css } from "../../../../styled-system/css";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();

      if (error) {
        router.push("/login?error=認証に失敗しました");
        return;
      }

      router.push("/dashboard");
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return (
    <div className={containerStyle}>
      <p>認証中...</p>
    </div>
  );
}

const containerStyle = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
});
