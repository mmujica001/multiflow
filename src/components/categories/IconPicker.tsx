"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

const ICONS = [
  "restaurant", "shopping_bag", "local_hospital", "directions_car",
  "receipt", "home", "movie", "more_horiz",
  "shopping_cart", "flight", "school", "fitness_center",
  "pets", "phone_iphone", "laptop", "tv",
  "music_note", "sports_esports", "coffee", "local_gas_station",
  "park", "beach_access", "celebration", "card_giftcard",
  "paint", "construction", "eco", "water_drop",
  "bolt", "wifi", "whatshot", "monetization_on",
  "account_balance", "savings", "trending_up", "trending_down",
  "payments", "credit_card", "wallet", "currency_exchange",
  "account_balance_wallet", "paid", "attach_money", "point_of_sale",
];

interface IconPickerProps {
  selected: string;
  onSelect: (icon: string) => void;
}

export function IconPicker({ selected, onSelect }: IconPickerProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filtered = search
    ? ICONS.filter((icon) => icon.includes(search.toLowerCase()))
    : ICONS;

  return (
    <div>
      <label className="text-sm font-medium text-on-surface mb-3 block">
        {t("categories.selectIcon")}
      </label>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("categories.searchIcon")}
        className="w-full bg-surface-container-lowest rounded-xl px-4 py-2.5 border border-outline-variant/20 text-sm mb-3 focus:outline-none focus:border-primary transition-colors"
      />
      <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
        {filtered.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => onSelect(icon)}
            className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
              selected === icon
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-xl">{icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
