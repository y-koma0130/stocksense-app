"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { css } from "../../../styled-system/css";
import { useSetFeedbackModalOpen } from "@/features/feedback/stores/feedbackModal";

type AccountMenuProps = Readonly<{
  email: string;
}>;

export const AccountMenu = ({ email }: AccountMenuProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const setFeedbackModalOpen = useSetFeedbackModalOpen();

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleFeedback = () => {
    setIsOpen(false);
    setFeedbackModalOpen(true);
  };

  return (
    <div className={containerStyle} ref={menuRef}>
      <button
        type="button"
        className={iconButtonStyle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="アカウントメニュー"
      >
        <svg className={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="8" r="4" strokeWidth="2" />
          <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" strokeWidth="2" />
        </svg>
      </button>

      {isOpen && (
        <div className={menuStyle}>
          <div className={emailSectionStyle}>
            <p className={userLabelStyle}>ログイン中のユーザー</p>
            <p className={emailTextStyle}>{email}</p>
          </div>
          <div className={dividerStyle} />
          <button type="button" className={menuItemStyle} onClick={handleFeedback}>
            フィードバックを送る
          </button>
          <button type="button" className={menuItemStyle} onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
};

const containerStyle = css({
  position: "relative",
});

const iconButtonStyle = css({
  background: "none",
  border: "1px solid",
  borderColor: "text",
  cursor: "pointer",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background-color 0.2s, border-color 0.2s",
  _hover: {
    backgroundColor: "surfaceHover",
    borderColor: "primary",
  },
});

const iconStyle = css({
  width: "20px",
  height: "20px",
  color: "text",
});

const menuStyle = css({
  position: "absolute",
  top: "calc(100% + 0.5rem)",
  right: 0,
  backgroundColor: "cardBg",
  border: "1px solid",
  borderColor: "border",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  minWidth: "240px",
  zIndex: 1000,
  overflow: "hidden",
});

const emailSectionStyle = css({
  padding: "0.75rem 1rem",
  backgroundColor: "surfaceHover",
});

const userLabelStyle = css({
  fontSize: "0.75rem",
  color: "textMuted",
  margin: 0,
  marginBottom: "0.25rem",
  fontWeight: "500",
});

const emailTextStyle = css({
  fontSize: "0.875rem",
  color: "text",
  margin: 0,
  wordBreak: "break-all",
});

const dividerStyle = css({
  height: "1px",
  backgroundColor: "border",
});

const menuItemStyle = css({
  width: "100%",
  padding: "0.75rem 1rem",
  textAlign: "left",
  background: "none",
  border: "none",
  color: "text",
  fontSize: "0.875rem",
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    backgroundColor: "surfaceHover",
    color: "primary",
  },
  "&:active": {
    backgroundColor: "cardBgHover",
    transform: "scale(0.98)",
  },
});
