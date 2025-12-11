"use client";

import { useCallback, useMemo } from "react";
import { Select } from "@/components/ui/Select";
import type { FilterListDto } from "@/server/features/filterList/application/dto/filterList.dto";
import { css } from "../../../../styled-system/css";

type FilterListSelectorProps = {
  filterLists: FilterListDto[];
  selectedListId: string | null;
  onSelect: (listId: string | null) => void;
  isLoading?: boolean;
};

const MAX_NAME_LENGTH = 15;

const truncateName = (name: string): string => {
  if (name.length <= MAX_NAME_LENGTH) return name;
  return `${name.slice(0, MAX_NAME_LENGTH)}...`;
};

export const FilterListSelector = ({
  filterLists,
  selectedListId,
  onSelect,
  isLoading = false,
}: FilterListSelectorProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onSelect(value === "" ? null : value);
    },
    [onSelect],
  );

  const options = useMemo(() => {
    return [
      { id: "", name: "すべての銘柄" },
      ...filterLists.map((list) => ({ id: list.id, name: truncateName(list.name) })),
    ];
  }, [filterLists]);

  // マイリストがない場合は非活性化
  const isDisabled = isLoading || filterLists.length === 0;

  return (
    <Select
      className={selectorStyle}
      value={selectedListId ?? ""}
      onChange={handleChange}
      disabled={isDisabled}
      aria-label="フィルターリスト選択"
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </Select>
  );
};

const selectorStyle = css({
  minWidth: "180px",
  maxWidth: "220px",
});
