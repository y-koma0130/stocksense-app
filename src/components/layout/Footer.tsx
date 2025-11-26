"use client";

import Link from "next/link";
import { css } from "../../../styled-system/css";

export const Footer = () => {
  return (
    <footer className={footerStyle}>
      <div className={containerStyle}>
        <nav className={linksStyle}>
          <Link href="/" className={linkStyle}>
            ホーム
          </Link>
          <Link href="/terms" className={linkStyle}>
            利用規約
          </Link>
          <Link href="/privacy" className={linkStyle}>
            プライバシーポリシー
          </Link>
        </nav>
        <p className={copyrightStyle}>© 2025 StockSense. All rights reserved.</p>
      </div>
    </footer>
  );
};

const footerStyle = css({
  borderTop: "1px solid {colors.border}",
  backgroundColor: "background",
  padding: "1rem 2rem",
  marginTop: "auto",
});

const containerStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "2rem",
  flexWrap: "wrap",
});

const linksStyle = css({
  display: "flex",
  gap: "1.5rem",
});

const linkStyle = css({
  fontSize: "0.875rem",
  color: "textMuted",
  textDecoration: "none",
  transition: "color 0.2s",
  _hover: {
    color: "primary",
  },
});

const copyrightStyle = css({
  fontSize: "0.875rem",
  color: "textMuted",
  margin: 0,
});
