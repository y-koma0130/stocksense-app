import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { MarketSummary } from "@/features/marketSummary/components/MarketSummary";
import { ValueStockRanking } from "@/features/valueStockScoring/components/ValueStockRanking";
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
        <HeroSection />
        <MarketSummary />
        <div className={spacerStyle} />
        <ValueStockRanking />
      </div>
    </>
  );
}

const containerStyle = css({
  minHeight: "calc(100vh - 68px)",
  padding: "1rem",
  backgroundColor: "background",
});

const spacerStyle = css({
  height: "3rem",
});
