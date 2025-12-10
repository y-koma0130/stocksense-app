"use client";

import { useEffect, useState } from "react";
import { AccountMenu } from "@/components/account/AccountMenu";
import { FeedbackModalContainer } from "@/features/feedback/components/FeedbackModalContainer";
import { FilterListButton } from "@/features/filterList/components/FilterListButton";
import { FilterListDrawerContainer } from "@/features/filterList/components/FilterListDrawerContainer";
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
        <FilterListButton />
        <NotificationButton />
        <HelpButton />
        {userEmail && <AccountMenu email={userEmail} />}
      </div>
      <FilterListDrawerContainer />
      <NotificationSettingsDrawerContainer />
      <FeedbackModalContainer />
    </>
  );
};

const actionsStyle = css({
  display: "flex",
  alignItems: "center",
  gap: { base: "0.375rem", md: "0.5rem" },
});
