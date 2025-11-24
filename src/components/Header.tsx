import Image from "next/image";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { css } from "../../styled-system/css";
import { HelpButton } from "./HelpButton";

export function Header() {
  return (
    <header className={headerStyle}>
      <div className={logoContainerStyle}>
        <Image src="/Logo.svg" alt="StockSense Logo" width={150} height={45} priority />
      </div>
      <div className={actionsStyle}>
        <HelpButton />
        <LogoutButton />
      </div>
    </header>
  );
}

const headerStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem 2rem",
  backgroundColor: "background",
  borderBottom: "1px solid {colors.border}",
  position: "sticky",
  top: 0,
  zIndex: 50,
});

const logoContainerStyle = css({
  display: "flex",
  alignItems: "center",
});

const actionsStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
});
