import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { MarketSummary } from "@/features/dashboard/components/MarketSummary";
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
        <MarketSummary />
      </div>
    </>
  );
}

const containerStyle = css({
  minHeight: "calc(100vh - 68px)",
  padding: "2rem",
  backgroundColor: "background",
});
