import { useState, useMemo, useRef, useEffect } from 'react';
import { SearchInput } from './SearchInput';
import { usePickerKeyboard } from '../utils/usePickerKeyboard';

interface Props {
  options: { label: string; value: string }[];
  selectedValue?: string;
  onSelect: (rawValue: string, displayValue: string) => void;
  onClose?: () => void;
}

// Only render rows in the visible window plus a small overscan buffer.
const ITEM_HEIGHT   = 36;
const VISIBLE_COUNT = 8;
const OVERSCAN      = 4;

export function EnumPicker({ options, selectedValue, onSelect, onClose }: Props) {
  const [search, setSearch]       = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef   = useRef<HTMLDivElement>(null);

  useEffect(() => { searchRef.current?.focus(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, search]);

  const { highlightIdx, setHighlightIdx, handleKeyDown } = usePickerKeyboard(filtered, onSelect, onClose);

  // Jump to the already-selected item when the picker first opens.
  useEffect(() => {
    if (!selectedValue || !listRef.current) return;
    const idx = filtered.findIndex((o) => o.value === selectedValue);
    if (idx > 0) listRef.current.scrollTop = idx * ITEM_HEIGHT;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep keyboard-highlighted row in view.
  useEffect(() => {
    if (highlightIdx < 0 || !listRef.current) return;
    const top        = highlightIdx * ITEM_HEIGHT;
    const containerH = Math.min(VISIBLE_COUNT * ITEM_HEIGHT, filtered.length * ITEM_HEIGHT);
    const cur        = listRef.current.scrollTop;
    if      (top < cur)                            listRef.current.scrollTop = top;
    else if (top + ITEM_HEIGHT > cur + containerH) listRef.current.scrollTop = top + ITEM_HEIGHT - containerH;
  }, [highlightIdx, filtered.length]);

  const totalH       = filtered.length * ITEM_HEIGHT;
  const startIdx     = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIdx       = Math.min(filtered.length, Math.ceil((scrollTop + VISIBLE_COUNT * ITEM_HEIGHT) / ITEM_HEIGHT) + OVERSCAN);
  const visibleItems = filtered.slice(startIdx, endIdx);

  return (
    // nowheel prevents React Flow from zooming the canvas while scrolling this list.
    <div onKeyDown={handleKeyDown} onWheel={(e) => e.stopPropagation()} className="nowheel">
      {options.length > 5 && (
        <SearchInput
          ref={searchRef}
          value={search}
          onChange={setSearch}
          onClear={() => { setSearch(''); searchRef.current?.focus(); }}
        />
      )}

      <div
        ref={listRef}
        className="overflow-y-auto"
        style={{ height: Math.min(VISIBLE_COUNT * ITEM_HEIGHT, totalH) }}
        onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
      >
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-center text-gray-400 text-[13px]">No options found</div>
        ) : (
          // Full virtual height keeps the scrollbar accurate.
          <div style={{ height: totalH, position: 'relative' }}>
            {visibleItems.map((opt, i) => {
              const idx           = startIdx + i;
              const isSelected    = selectedValue === opt.value;
              const isHighlighted = idx === highlightIdx && !isSelected;
              return (
                <div key={opt.value}
                  onClick={() => onSelect(opt.value, opt.label)}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  className={`px-3 flex items-center justify-between text-sm cursor-pointer transition-colors
                              ${isSelected                    ? 'bg-brand-light text-gray-900' : ''}
                              ${isHighlighted                 ? 'bg-brand-light' : ''}
                              ${!isSelected && !isHighlighted ? 'hover:bg-brand-light' : ''}`}
                  style={{ position: 'absolute', top: idx * ITEM_HEIGHT, left: 0, right: 0, height: ITEM_HEIGHT }}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <span className="text-sm font-semibold ml-2 shrink-0" aria-hidden>✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
