"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { trpc } from "../../../../trpc/client";

type AuthCallbackState = {
  error: string | null;
  isProcessing: boolean;
};

/**
 * 認証コールバック処理を行うカスタムフック
 * - セッションの確立（ハッシュフラグメント or 既存セッション）
 * - サブスクリプションの初期化
 * - LINE連携（オプション）
 */
export const useAuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [state, setState] = useState<AuthCallbackState>({
    error: null,
    isProcessing: true,
  });

  const linkLineAccountMutation = trpc.lineNotification.linkLineAccount.useMutation();
  const initializeSubscriptionMutation = trpc.userSubscription.initialize.useMutation();

  const handleAuthError = useCallback(() => {
    setState({ error: "認証に失敗しました", isProcessing: false });
    setTimeout(() => router.push("/login?error=認証に失敗しました"), 2000);
  }, [router]);

  const initializeUserData = useCallback(
    async (lineUserId: string | null) => {
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
    },
    [initializeSubscriptionMutation, linkLineAccountMutation],
  );

  const processHashSession = useCallback(async (): Promise<{
    processed: boolean;
    success: boolean;
  }> => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      return { processed: false, success: false };
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      handleAuthError();
      return { processed: true, success: false };
    }

    return { processed: true, success: true };
  }, [supabase.auth, handleAuthError]);

  const processExistingSession = useCallback(async (): Promise<boolean> => {
    const { data, error: getSessionError } = await supabase.auth.getSession();

    if (getSessionError || !data.session) {
      handleAuthError();
      return false;
    }

    return true;
  }, [supabase.auth, handleAuthError]);

  useEffect(() => {
    let isMounted = true;

    const handleAuthCallback = async () => {
      const lineUserId = searchParams.get("lineUserId");

      // ハッシュフラグメントからセッションを処理
      const hashResult = await processHashSession();

      if (hashResult.processed) {
        if (!hashResult.success || !isMounted) return;

        await initializeUserData(lineUserId);
        if (isMounted) {
          router.push("/dashboard");
        }
        return;
      }

      // ハッシュがない場合は既存セッションを確認
      const hasValidSession = await processExistingSession();
      if (!hasValidSession || !isMounted) return;

      await initializeUserData(lineUserId);
      if (isMounted) {
        router.push("/dashboard");
      }
    };

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams, processHashSession, processExistingSession, initializeUserData]);

  return state;
};
