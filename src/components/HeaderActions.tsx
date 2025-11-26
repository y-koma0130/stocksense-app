"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AccountMenu } from "@/components/account/AccountMenu";
import { NotificationButton } from "@/features/lineNotification/components/NotificationButton";
import { NotificationSettingsDrawerContainer } from "@/features/lineNotification/components/NotificationSettingsDrawerContainer";
import { FeedbackModalContainer } from "@/features/feedback/components/FeedbackModalContainer";
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
  gap: "0.75rem",
});
