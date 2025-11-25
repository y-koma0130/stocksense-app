"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { css } from "../../../../styled-system/css";
import { trpc } from "../../../../trpc/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);

  const linkLineAccountMutation = trpc.lineNotification.linkLineAccount.useMutation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // URLクエリパラメータからlineUserIdを取得
      const lineUserId = searchParams.get("lineUserId");

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

        // LINE連携がある場合は自動紐付け
        if (lineUserId) {
          try {
            await linkLineAccountMutation.mutateAsync({ lineUserId });
          } catch (linkError) {
            console.error("LINE連携エラー:", linkError);
            // LINE連携失敗してもログインは継続
          }
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

      // LINE連携がある場合は自動紐付け
      if (lineUserId) {
        try {
          await linkLineAccountMutation.mutateAsync({ lineUserId });
        } catch (linkError) {
          console.error("LINE連携エラー:", linkError);
          // LINE連携失敗してもログインは継続
        }
      }

      router.push("/dashboard");
    };

    handleAuthCallback();
  }, [router, supabase.auth, searchParams, linkLineAccountMutation]);

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
