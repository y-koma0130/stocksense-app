"use client";

import { useEffect, useState } from "react";

interface MarketData {
  id: string;
  title: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export function useMarketData() {
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        setLoading(true);
        const response = await fetch("/api/market");

        if (!response.ok) {
          throw new Error("Failed to fetch market data");
        }

        const marketData = (await response.json()) as MarketData[];
        setData(marketData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchMarketData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}
