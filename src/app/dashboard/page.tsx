import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { css } from "../../../styled-system/css";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className={containerStyle}>
      <div className={headerStyle}>
        <h1 className={titleStyle}>StockSense Dashboard</h1>
        <LogoutButton />
      </div>

      <div className={cardStyle}>
        <h2 className={welcomeStyle}>ようこそ!</h2>
        <p className={emailStyle}>{user.email}</p>
        <p className={descriptionStyle}>
          ここからAIが見つける買い時の銘柄を確認できます。
        </p>
      </div>
    </div>
  );
}

const containerStyle = css({
  minHeight: "100vh",
  padding: "2rem",
  backgroundColor: "#434343",
});

const headerStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2rem",
});

const titleStyle = css({
  fontSize: "2rem",
  fontWeight: "700",
  color: "#E5E5E5",
});

const cardStyle = css({
  backgroundColor: "#2E2E2E",
  borderRadius: "12px",
  padding: "2.5rem",
  maxWidth: "600px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
});

const welcomeStyle = css({
  fontSize: "1.5rem",
  fontWeight: "600",
  color: "#E9F355",
  marginBottom: "1rem",
});

const emailStyle = css({
  fontSize: "1rem",
  color: "#E5E5E5",
  marginBottom: "1.5rem",
  opacity: 0.8,
});

const descriptionStyle = css({
  fontSize: "1rem",
  color: "#E5E5E5",
  lineHeight: "1.6",
});
