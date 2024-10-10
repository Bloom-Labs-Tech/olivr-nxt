"use client";

import { Plus } from "lucide-react";
import { type Stats, useStats } from "~/hooks/useStats";
import { MagicCard, MagicCards } from "../magicui/cards";
import NumberTicker from "../magicui/number-ticker";

const formatValue = (value: number) =>
  value > 1_000_000_000
    ? value / 1_000_000_000
    : value > 1_000_000
    ? value / 1_000_000
    : value > 1_000
    ? value / 1_000
    : value;

const formatValueLabel = (value: number) =>
  value > 1_000_000_000
    ? "B"
    : value > 1_000_000
    ? "M"
    : value > 1_000
    ? "K"
    : "";

const displayedStats: (keyof Stats)[] = [
  "users",
  "guilds",
  "dynamicVoicesCreated",
  "translations",
];

const formatLabel = (label: string) =>
  label
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export function StatsSection() {
  const { data } = useStats();

  return (
    <MagicCards parentId="stats">
      {displayedStats.map((stat) => {
        const value = data[stat] ?? 0;

        return (
          <MagicCard key={`stat-${stat}`} className="!w-[262px] !h-[134px]">
            <div className="flex flex-col w-full h-full">
              <p className="text-gray-300 mb-2 text-xl">{formatLabel(stat)}</p>
              <div className="text-4xl font-medium mb-2 flex items-center w-full justify-center">
                {/* only have the number, nothing after thousand million ect */}
                <NumberTicker value={formatValue(value)} decimalPlaces={0} />
                {formatValueLabel(value)}
                {value > 1_000 && <Plus className="h-6 w-6 ml-1" />}
              </div>
            </div>
          </MagicCard>
        );
      })}
    </MagicCards>
  );
}
