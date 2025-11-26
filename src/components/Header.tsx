import Image from "next/image";
import { css } from "../../styled-system/css";
import { HeaderActions } from "./HeaderActions";

export const Header = () => {
  return (
    <header className={headerStyle}>
      <div className={logoContainerStyle}>
        {/* モバイル: アイコンのみ */}
        <Image
          src="/LogoIcon.svg"
          alt="StockSense"
          width={32}
          height={32}
          priority
          className={mobileLogoStyle}
        />
        {/* デスクトップ: フルロゴ */}
        <Image
          src="/Logo.svg"
          alt="StockSense Logo"
          width={150}
          height={45}
          priority
          className={desktopLogoStyle}
        />
      </div>
      <HeaderActions />
    </header>
  );
};

const headerStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: { base: "0.5rem 1rem", md: "0.75rem 2rem" },
  backgroundColor: "background",
  borderBottom: "1px solid {colors.border}",
  position: "sticky",
  top: 0,
  zIndex: 50,
});

const logoContainerStyle = css({
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
});

const mobileLogoStyle = css({
  display: { base: "block", md: "none" },
  width: "32px",
  height: "32px",
});

const desktopLogoStyle = css({
  display: { base: "none", md: "block" },
  width: "150px",
  height: "auto",
});
