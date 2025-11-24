"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { css } from "../../../../styled-system/css";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // URLのハッシュフラグメントからトークンを処理
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        // ハッシュフラグメントからセッションを設定
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError("認証に失敗しました");
          setTimeout(() => router.push("/login?error=認証に失敗しました"), 2000);
          return;
        }

        router.push("/dashboard");
        return;
      }

      // ハッシュがない場合は通常のセッション確認
      const { data, error: getSessionError } = await supabase.auth.getSession();

      if (getSessionError || !data.session) {
        setError("認証に失敗しました");
        setTimeout(() => router.push("/login?error=認証に失敗しました"), 2000);
        return;
      }

      router.push("/dashboard");
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return (
    <div className={containerStyle}>
      <p>{error ?? "認証中..."}</p>
    </div>
  );
}

const containerStyle = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
});
