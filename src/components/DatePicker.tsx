import { useState, useCallback, useMemo } from 'react';

interface Props {
  onSelect: (rawValue: string, displayValue: string) => void;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// rawValue  → ISO 8601 (YYYY-MM-DDT00:00:00.000Z) for the database
// displayValue → DD/MM/YYYY shown to the user
export function DatePicker({ onSelect }: Props) {
  const today = useMemo(() => new Date(), []);
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState<{ year: number; month: number; day: number } | null>(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay    = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) { setViewYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  const handleDayClick = useCallback(
    (day: number) => {
      setSelected({ year: viewYear, month: viewMonth, day });
      const mm  = String(viewMonth + 1).padStart(2, '0');
      const dd  = String(day).padStart(2, '0');
      onSelect(`${viewYear}-${mm}-${dd}T00:00:00.000Z`, `${dd}/${mm}/${viewYear}`);
    },
    [viewYear, viewMonth, onSelect]
  );

  const isToday    = (d: number) => viewYear === today.getFullYear() && viewMonth === today.getMonth() && d === today.getDate();
  const isSelected = (d: number) => !!selected && viewYear === selected.year && viewMonth === selected.month && d === selected.day;

  // Build grid cells: leading nulls for the offset, then day numbers
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="p-3 w-full sm:w-[228px]">

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={prevMonth} aria-label="Previous month"
          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500
                     hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span className="text-[13px] font-semibold text-gray-800">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>

        <button type="button" onClick={nextMonth} aria-label="Next month"
          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500
                     hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Calendar grid — 7 columns */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Day-of-week headers */}
        {DAY_HEADERS.map((d) => (
          <div key={d} className="h-7 flex items-center justify-center text-[11px] font-medium text-gray-400">
            {d}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((day, idx) =>
          day === null ? (
            <div key={`e-${idx}`} />
          ) : (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              className={`h-7 w-full flex items-center justify-center rounded-md text-[13px]
                          border-none cursor-pointer transition-colors
                          ${isSelected(day)
                            ? 'bg-brand text-white font-semibold'
                            : isToday(day)
                            ? 'border border-brand text-brand font-semibold bg-transparent hover:bg-brand-light'
                            : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}
            >
              {day}
            </button>
          )
        )}
      </div>
    </div>
  );
}
