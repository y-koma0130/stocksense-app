import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LogoutButton } from "@/features/auth";
import { createClient } from "@/lib/supabase/server";
import { css } from "../../../styled-system/css";

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

      <Card>
        <CardHeader>
          <CardTitle>ようこそ!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={emailStyle}>{user.email}</p>
          <p className={descriptionStyle}>ここからAIが見つける買い時の銘柄を確認できます。</p>
        </CardContent>
      </Card>
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
