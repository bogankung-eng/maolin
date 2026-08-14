import { CITIES } from '@/mock/data';

/** 城市选择器：pill 横滚，本地 useState 由 LocalView 持有，不持久化 */
export function CityPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (city: string) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {CITIES.map((city) => {
        const active = value === city;
        return (
          <button
            key={city}
            onClick={() => onChange(city)}
            className={`transition-bg whitespace-nowrap rounded-pill border px-3 py-1.5 text-sm ${
              active
                ? 'border-brand bg-brand text-white'
                : 'border-border bg-surface text-text-secondary'
            }`}
          >
            {city}
          </button>
        );
      })}
    </div>
  );
}
