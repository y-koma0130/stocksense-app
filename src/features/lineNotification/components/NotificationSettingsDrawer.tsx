"use client";

import Image from "next/image";
import { Drawer } from "@/components/ui/Drawer";
import { css } from "../../../../styled-system/css";

type NotificationSettingsDrawerProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  isLinked: boolean;
  notificationEnabled: boolean;
  onToggleNotification: () => void;
  lineAddFriendUrl: string;
}>;

export const NotificationSettingsDrawer = ({
  isOpen,
  onClose,
  isLoading,
  isLinked,
  notificationEnabled,
  onToggleNotification,
  lineAddFriendUrl,
}: NotificationSettingsDrawerProps) => {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="LINE通知設定" width="400px">
      {isLoading ? (
        <div className={loadingContainerStyle}>
          <div className={spinnerStyle} />
          <p className={loadingTextStyle}>読み込み中...</p>
        </div>
      ) : (
        <>
          {/* 連携状態 */}
          <div className={sectionStyle}>
            <h4 className={sectionTitleStyle}>連携状態</h4>
            <div className={statusContainerStyle}>
              <span className={isLinked ? statusLinkedStyle : statusUnlinkedStyle}>
                {isLinked ? "連携済み" : "未連携"}
              </span>
            </div>
          </div>

          {isLinked ? (
            <>
              {/* 通知ON/OFF */}
              <div className={sectionStyle}>
                <h4 className={sectionTitleStyle}>通知設定</h4>
                <div className={toggleContainerStyle}>
                  <span className={toggleLabelStyle}>週次・月次の割安株通知</span>
                  <button
                    type="button"
                    onClick={onToggleNotification}
                    className={toggleButtonStyle}
                    aria-pressed={notificationEnabled}
                  >
                    <span className={toggleTrackStyle} data-enabled={notificationEnabled} />
                    <span className={toggleThumbStyle} data-enabled={notificationEnabled} />
                  </button>
                </div>
                <p className={toggleDescriptionStyle}>
                  {notificationEnabled
                    ? "毎週・毎月の割安株ランキングをLINEでお届けします"
                    : "通知はオフになっています"}
                </p>
              </div>

              {/* 将来の絞り込み設定（プレースホルダー） */}
              <div className={sectionStyle}>
                <h4 className={sectionTitleStyle}>通知対象（Coming Soon）</h4>
                <p className={comingSoonTextStyle}>
                  市場や業種で通知銘柄を絞り込む機能を準備中です
                </p>
              </div>
            </>
          ) : (
            <>
              {/* LINE友だち追加 */}
              <div className={sectionStyle}>
                <h4 className={sectionTitleStyle}>LINEで通知を受け取る</h4>
                <p className={descriptionStyle}>
                  LINE公式アカウントを友だち追加すると、割安株の通知を受け取れます。
                </p>

                {/* QRコード */}
                <div className={qrContainerStyle}>
                  <Image
                    src="/LINE_QR_CODE.png"
                    alt="LINE友だち追加QRコード"
                    width={160}
                    height={160}
                    className={qrImageStyle}
                  />
                  <p className={qrCaptionStyle}>スマートフォンで読み取ってください</p>
                </div>

                {/* リンクボタン */}
                <a
                  href={lineAddFriendUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={lineButtonStyle}
                >
                  LINEアプリで開く
                </a>
              </div>

              {/* 連携手順 */}
              <div className={sectionStyle}>
                <h4 className={sectionTitleStyle}>連携手順</h4>
                <ol className={stepsListStyle}>
                  <li className={stepItemStyle}>
                    <span className={stepNumberStyle}>1</span>
                    <span>QRコードを読み取るか、ボタンから友だち追加</span>
                  </li>
                  <li className={stepItemStyle}>
                    <span className={stepNumberStyle}>2</span>
                    <span>LINEでアカウントを連携</span>
                  </li>
                  <li className={stepItemStyle}>
                    <span className={stepNumberStyle}>3</span>
                    <span>通知設定を完了</span>
                  </li>
                </ol>
              </div>
            </>
          )}
        </>
      )}
    </Drawer>
  );
};

const loadingContainerStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "3rem 1rem",
  gap: "1rem",
});

const spinnerStyle = css({
  width: "40px",
  height: "40px",
  border: "4px solid",
  borderColor: "surfaceHover",
  borderTopColor: "accent",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
});

const loadingTextStyle = css({
  fontSize: "0.875rem",
  color: "textMuted",
});

const sectionStyle = css({
  marginBottom: "1.5rem",
});

const sectionTitleStyle = css({
  fontSize: "0.875rem",
  fontWeight: "600",
  color: "textMuted",
  marginBottom: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

const statusContainerStyle = css({
  display: "flex",
  alignItems: "center",
});

const statusLinkedStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 1rem",
  backgroundColor: "rgba(34, 197, 94, 0.1)",
  color: "#22c55e",
  borderRadius: "6px",
  fontSize: "0.875rem",
  fontWeight: "600",
  _before: {
    content: '""',
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
  },
});

const statusUnlinkedStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 1rem",
  backgroundColor: "surfaceHover",
  color: "textMuted",
  borderRadius: "6px",
  fontSize: "0.875rem",
  fontWeight: "600",
  _before: {
    content: '""',
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "textMuted",
  },
});

const toggleContainerStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem 1rem",
  backgroundColor: "surfaceHover",
  borderRadius: "8px",
});

const toggleLabelStyle = css({
  fontSize: "0.875rem",
  fontWeight: "500",
  color: "text",
});

const toggleButtonStyle = css({
  position: "relative",
  width: "48px",
  height: "26px",
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
});

const toggleTrackStyle = css({
  position: "absolute",
  inset: 0,
  borderRadius: "13px",
  backgroundColor: "border",
  transition: "background-color 0.2s",
  '&[data-enabled="true"]': {
    backgroundColor: "#22c55e",
  },
});

const toggleThumbStyle = css({
  position: "absolute",
  top: "2px",
  left: "2px",
  width: "22px",
  height: "22px",
  borderRadius: "50%",
  backgroundColor: "white",
  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
  transition: "transform 0.2s",
  '&[data-enabled="true"]': {
    transform: "translateX(22px)",
  },
});

const toggleDescriptionStyle = css({
  marginTop: "0.5rem",
  fontSize: "0.75rem",
  color: "textMuted",
});

const comingSoonTextStyle = css({
  padding: "1rem",
  backgroundColor: "surfaceHover",
  borderRadius: "8px",
  fontSize: "0.875rem",
  color: "textMuted",
  textAlign: "center",
});

const descriptionStyle = css({
  fontSize: "0.875rem",
  color: "textMuted",
  lineHeight: "1.6",
  marginBottom: "1rem",
});

const qrContainerStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "1.5rem",
  marginBottom: "1rem",
  backgroundColor: "white",
  borderRadius: "8px",
});

const qrImageStyle = css({
  borderRadius: "4px",
});

const qrCaptionStyle = css({
  marginTop: "0.75rem",
  fontSize: "0.75rem",
  color: "#666",
});

const lineButtonStyle = css({
  display: "block",
  width: "100%",
  padding: "0.875rem",
  backgroundColor: "#06c755",
  color: "white",
  textAlign: "center",
  borderRadius: "8px",
  fontSize: "0.9375rem",
  fontWeight: "600",
  textDecoration: "none",
  transition: "background-color 0.2s",
  _hover: {
    backgroundColor: "#05b34c",
  },
});

const stepsListStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  listStyle: "none",
  padding: 0,
  margin: 0,
});

const stepItemStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  fontSize: "0.875rem",
  color: "text",
});

const stepNumberStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  backgroundColor: "accent",
  color: "cardBg",
  borderRadius: "50%",
  fontSize: "0.75rem",
  fontWeight: "600",
  flexShrink: 0,
});
