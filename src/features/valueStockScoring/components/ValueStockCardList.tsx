/**
 * モバイル用のバリュー株カードリストコンポーネント
 */

import type { ValueStockDto } from "@/server/features/valueStockScoring/application/dto/valueStock.dto";
import { css } from "../../../../styled-system/css";
import { ValueStockCard } from "./ValueStockCard";

type ValueStockCardListProps = Readonly<{
  data: readonly ValueStockDto[];
  onCardClick: (stock: ValueStockDto) => void;
  analyzedStockIds?: Set<string>;
}>;

export const ValueStockCardList = ({
  data,
  onCardClick,
  analyzedStockIds = new Set(),
}: ValueStockCardListProps) => {
  return (
    <div className={cardListStyle}>
      {data.map((stock, index) => (
        <ValueStockCard
          key={stock.stockId}
          stock={stock}
          rank={index + 1}
          onClick={() => onCardClick(stock)}
          isAnalyzed={analyzedStockIds.has(stock.stockId)}
        />
      ))}
    </div>
  );
};

const cardListStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});
