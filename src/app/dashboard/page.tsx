import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
    <>
      <Header />
      <div className={containerStyle}>
        <h1 className={titleStyle}>StockSense Dashboard</h1>

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
    </>
  );
}

const containerStyle = css({
  minHeight: "calc(100vh - 68px)",
  padding: "2rem",
  backgroundColor: "background",
});

const titleStyle = css({
  fontSize: "2rem",
  fontWeight: "700",
  color: "text",
  marginBottom: "2rem",
});

const emailStyle = css({
  fontSize: "1rem",
  color: "text",
  marginBottom: "1.5rem",
  opacity: 0.8,
});

const descriptionStyle = css({
  fontSize: "1rem",
  color: "text",
  lineHeight: "1.6",
});
