"use client";

import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { NotificationButton } from "@/features/lineNotification/components/NotificationButton";
import { NotificationSettingsDrawerContainer } from "@/features/lineNotification/components/NotificationSettingsDrawerContainer";
import { css } from "../../styled-system/css";
import { HelpButton } from "./HelpButton";

export const HeaderActions = () => {
  return (
    <>
      <div className={actionsStyle}>
        <HelpButton />
        <NotificationButton />
        <LogoutButton />
      </div>
      <NotificationSettingsDrawerContainer />
    </>
  );
};

const actionsStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
});
