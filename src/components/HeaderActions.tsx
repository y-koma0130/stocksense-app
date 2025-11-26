"use client";

import { useEffect, useState } from "react";
import { AccountMenu } from "@/components/account/AccountMenu";
import { FeedbackModalContainer } from "@/features/feedback/components/FeedbackModalContainer";
import { NotificationButton } from "@/features/lineNotification/components/NotificationButton";
import { NotificationSettingsDrawerContainer } from "@/features/lineNotification/components/NotificationSettingsDrawerContainer";
import { createClient } from "@/lib/supabase/client";
import { css } from "../../styled-system/css";
import { HelpButton } from "./HelpButton";

export const HeaderActions = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };

    getUser();
  }, []);

  return (
    <>
      <div className={actionsStyle}>
        <NotificationButton />
        <HelpButton />
        {userEmail && <AccountMenu email={userEmail} />}
      </div>
      <NotificationSettingsDrawerContainer />
      <FeedbackModalContainer />
    </>
  );
};

const actionsStyle = css({
  display: "flex",
  alignItems: "center",
  gap: { base: "0.5rem", md: "0.75rem" },
});
