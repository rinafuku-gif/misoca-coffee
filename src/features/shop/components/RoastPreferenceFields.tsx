import { isRoastBean, ROAST_LEVELS, type RoastLevel, type RoastPreferences } from "../roast-preferences";

export function RoastPreferenceFields({ items, preferences, disabled, onChange }: {
  items: readonly { skuId: string; name: string; recommended?: string }[];
  preferences: RoastPreferences;
  disabled: boolean;
  onChange(skuId: string, value?: RoastLevel): void;
}) {
  const beans = items.filter(item => isRoastBean(item.skuId));
  if (beans.length === 0) return null;
  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-3">
      <legend className="text-sm font-medium tracking-wide text-konsumi">焙煎度のご希望</legend>
      <p className="text-sm leading-relaxed text-haicha">ご注文後に焙煎します。同じ豆を複数ご注文の場合は、選んだ焙煎度でまとめてお作りします。</p>
      {beans.map(bean => (
        <label key={bean.skuId} className="grid min-w-0 gap-1.5 rounded-sm border border-usuzumi/70 p-3 text-sm text-konsumi">
          <span className="break-words">{bean.name}</span>
          <span className="relative block">
            <select
              value={preferences.find(item => item.skuId === bean.skuId)?.level ?? ""}
              onChange={({ currentTarget }) => onChange(bean.skuId, ROAST_LEVELS.find(level => level === currentTarget.value))}
              className="min-h-11 w-full min-w-0 appearance-none rounded-sm border border-karekusa/35 bg-kominka-white py-2 pl-3 pr-9 text-base text-sumi focus-visible:outline-2 focus-visible:outline-karekusa"
            >
              <option value="">お店のおすすめ{bean.recommended ? `（${bean.recommended}）` : ""}</option>
              {ROAST_LEVELS.map(level => <option key={level}>{level}</option>)}
            </select>
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-karekusa">
              <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
