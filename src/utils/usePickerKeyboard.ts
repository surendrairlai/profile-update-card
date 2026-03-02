import { useCallback, useState } from 'react';

interface Option { label: string; value: string; }

// Shared keyboard nav for BooleanPicker and EnumPicker.
export function usePickerKeyboard(
  filtered: Option[],
  onSelect: (rawValue: string, displayValue: string) => void,
  onClose?: () => void,
) {
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [prevFiltered, setPrevFiltered] = useState(filtered);

  if (prevFiltered !== filtered) {
    setPrevFiltered(filtered);
    setHighlightIdx(-1);
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      if (!filtered.length) return;
      switch (e.key) {
        case 'ArrowDown': setHighlightIdx((i) => (i < filtered.length - 1 ? i + 1 : 0)); break;
        case 'ArrowUp':   setHighlightIdx((i) => (i > 0 ? i - 1 : filtered.length - 1)); break;
        case 'Enter': {
          const item = filtered[highlightIdx];
          if (item) onSelect(item.value, item.label);
          break;
        }
        case 'Escape': onClose?.(); break;
      }
    },
    [filtered, highlightIdx, onSelect, onClose],
  );

  return { highlightIdx, setHighlightIdx, handleKeyDown };
}
