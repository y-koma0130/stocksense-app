"use client";

import { useCallback, useEffect, useState } from "react";
import { MARKET_OPTIONS, type MarketValue } from "@/assets/marketOptions";
import { PRICE_MAX_OPTIONS, PRICE_MIN_OPTIONS } from "@/assets/priceRangeOptions";
import { type SectorCode, STOCK_MARKET_SECTORS } from "@/assets/stockMarketSectors";
import { Drawer } from "@/components/ui/Drawer";
import { css } from "../../../../styled-system/css";
import type { FilterConditions, FilterList } from "../types/filterList";

type FilterListEditDrawerProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  editingList?: FilterList;
  onSave: (list: Omit<FilterList, "id" | "createdAt" | "updatedAt">) => void;
  onDelete?: () => void;
}>;

export const FilterListEditDrawer = ({
  isOpen,
  onClose,
  editingList,
  onSave,
  onDelete,
}: FilterListEditDrawerProps) => {
  const isNewList = !editingList;

  // フォーム状態
  const [name, setName] = useState("");
  const [selectedMarkets, setSelectedMarkets] = useState<MarketValue[]>([]);
  const [selectedSectorCodes, setSelectedSectorCodes] = useState<SectorCode[]>([]);
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");

  // 編集時は既存データで初期化
  useEffect(() => {
    if (editingList) {
      setName(editingList.name);
      setSelectedMarkets(editingList.filterConditions.markets ?? []);
      setSelectedSectorCodes(editingList.filterConditions.sectorCodes ?? []);
      setPriceMin(editingList.filterConditions.priceRange?.min?.toString() ?? "");
      setPriceMax(editingList.filterConditions.priceRange?.max?.toString() ?? "");
    } else {
      // 新規作成時はリセット
      setName("");
      setSelectedMarkets([]);
      setSelectedSectorCodes([]);
      setPriceMin("");
      setPriceMax("");
    }
  }, [editingList]);

  const handleMarketToggle = useCallback((market: MarketValue) => {
    setSelectedMarkets((prev) =>
      prev.includes(market) ? prev.filter((m) => m !== market) : [...prev, market],
    );
  }, []);

  const handleSectorToggle = useCallback((sectorCode: SectorCode) => {
    setSelectedSectorCodes((prev) =>
      prev.includes(sectorCode) ? prev.filter((s) => s !== sectorCode) : [...prev, sectorCode],
    );
  }, []);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      return;
    }

    const min = priceMin ? parseInt(priceMin, 10) : null;
    const max = priceMax ? parseInt(priceMax, 10) : null;

    const filterConditions: FilterConditions = {
      markets: selectedMarkets.length > 0 ? selectedMarkets : null,
      sectorCodes: selectedSectorCodes.length > 0 ? selectedSectorCodes : null,
      priceRange: min !== null || max !== null ? { min, max } : null,
    };

    onSave({
      name: name.trim(),
      filterConditions,
    });
  }, [name, selectedMarkets, selectedSectorCodes, priceMin, priceMax, onSave]);

  const title = (
    <div className={titleContainerStyle}>
      <button type="button" onClick={onClose} className={backButtonStyle} aria-label="戻る">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span>{isNewList ? "新しいリストを作成" : "リストを編集"}</span>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={title} width="420px">
      <div className={formContainerStyle}>
        {/* リスト名 */}
        <div className={fieldStyle}>
          <label className={labelStyle} htmlFor="filter-list-name">
            リスト名
          </label>
          <input
            id="filter-list-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: プライム高配当"
            className={inputStyle}
            maxLength={50}
          />
        </div>

        {/* 市場 */}
        <div className={fieldStyle}>
          <span className={labelStyle}>市場</span>
          <div className={checkboxGroupStyle}>
            {MARKET_OPTIONS.map((option) => (
              <label key={option.value} className={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={selectedMarkets.includes(option.value)}
                  onChange={() => handleMarketToggle(option.value)}
                  className={checkboxInputStyle}
                />
                <span className={checkboxTextStyle}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 価格帯 */}
        <div className={fieldStyle}>
          <span className={labelStyle}>価格帯</span>
          <div className={priceRangeContainerStyle}>
            <select
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className={selectStyle}
              aria-label="最小価格"
            >
              {PRICE_MIN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className={priceRangeSeparatorStyle}>〜</span>
            <select
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className={selectStyle}
              aria-label="最大価格"
            >
              {PRICE_MAX_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 業種 */}
        <div className={fieldStyle}>
          <div className={labelWithCountStyle}>
            <span className={labelStyle}>業種</span>
            {selectedSectorCodes.length > 0 && (
              <span className={selectedCountStyle}>{selectedSectorCodes.length}件選択中</span>
            )}
          </div>
          <div className={sectorGridStyle}>
            {STOCK_MARKET_SECTORS.map((sector) => (
              <label key={sector.sectorCode} className={sectorCheckboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={selectedSectorCodes.includes(sector.sectorCode)}
                  onChange={() => handleSectorToggle(sector.sectorCode)}
                  className={checkboxInputStyle}
                />
                <span className={sectorCheckboxTextStyle}>{sector.sectorName}</span>
              </label>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className={actionsStyle}>
          <button
            type="button"
            onClick={handleSave}
            className={saveButtonStyle}
            disabled={!name.trim()}
          >
            {isNewList ? "作成" : "保存"}
          </button>
          {!isNewList && onDelete && (
            <button type="button" onClick={onDelete} className={deleteButtonStyle}>
              削除
            </button>
          )}
        </div>
      </div>
    </Drawer>
  );
};

const titleContainerStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

const backButtonStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  background: "none",
  border: "none",
  borderRadius: "4px",
  color: "textMuted",
  cursor: "pointer",
  transition: "all 0.2s",
  _hover: {
    backgroundColor: "cardBgHover",
    color: "text",
  },
});

const formContainerStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

const fieldStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

const labelStyle = css({
  fontSize: "0.8125rem",
  fontWeight: "600",
  color: "text",
});

const inputStyle = css({
  width: "100%",
  padding: "0.75rem 1rem",
  backgroundColor: "cardBgHover",
  border: "1px solid",
  borderColor: "border",
  borderRadius: "6px",
  color: "text",
  fontSize: "0.9375rem",
  outline: "none",
  transition: "border-color 0.2s",
  _focus: {
    borderColor: "accent",
  },
  _placeholder: {
    color: "textMuted",
  },
});

const checkboxGroupStyle = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
});

const checkboxLabelStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  cursor: "pointer",
});

const checkboxInputStyle = css({
  width: "18px",
  height: "18px",
  accentColor: "#E9F355",
  cursor: "pointer",
});

const checkboxTextStyle = css({
  fontSize: "0.875rem",
  color: "text",
});

const labelWithCountStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const selectedCountStyle = css({
  fontSize: "0.75rem",
  color: "accent",
  fontWeight: "500",
});

const sectorGridStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "0.5rem",
  maxHeight: "200px",
  overflowY: "auto",
  padding: "0.5rem",
  backgroundColor: "cardBgHover",
  borderRadius: "6px",
  border: "1px solid",
  borderColor: "border",
});

const sectorCheckboxLabelStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  cursor: "pointer",
  padding: "0.25rem",
  borderRadius: "4px",
  transition: "background-color 0.2s",
  _hover: {
    backgroundColor: "cardBg",
  },
});

const sectorCheckboxTextStyle = css({
  fontSize: "0.75rem",
  color: "text",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const priceRangeContainerStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

const selectStyle = css({
  flex: 1,
  padding: "0.625rem 0.75rem",
  backgroundColor: "cardBgHover",
  border: "1px solid",
  borderColor: "border",
  borderRadius: "6px",
  color: "text",
  fontSize: "0.8125rem",
  outline: "none",
  cursor: "pointer",
  transition: "border-color 0.2s",
  _focus: {
    borderColor: "accent",
  },
  "& option": {
    backgroundColor: "cardBg",
    color: "text",
  },
});

const priceRangeSeparatorStyle = css({
  color: "textMuted",
  fontSize: "0.875rem",
  flexShrink: 0,
});

const actionsStyle = css({
  display: "flex",
  gap: "0.75rem",
  marginTop: "0.5rem",
});

const saveButtonStyle = css({
  flex: 1,
  padding: "0.5rem 1rem",
  backgroundColor: "accent",
  border: "none",
  borderRadius: "6px",
  color: "background",
  fontSize: "0.875rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "opacity 0.2s",
  _hover: {
    opacity: 0.9,
  },
  _disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});

const deleteButtonStyle = css({
  padding: "0.5rem 1rem",
  backgroundColor: "transparent",
  border: "1px solid",
  borderColor: "error",
  borderRadius: "6px",
  color: "error",
  fontSize: "0.875rem",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s",
  _hover: {
    backgroundColor: "errorBg",
    borderColor: "error",
  },
});
