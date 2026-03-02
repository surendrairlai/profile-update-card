import { usePickerKeyboard } from '../utils/usePickerKeyboard';

interface Props {
  options: { label: string; value: string }[];
  selectedValue?: string;
  onSelect: (rawValue: string, displayValue: string) => void;
  onClose?: () => void;
}

export function BooleanPicker({ options, selectedValue, onSelect, onClose }: Props) {
  const { highlightIdx, setHighlightIdx, handleKeyDown } = usePickerKeyboard(options, onSelect, onClose);

  return (
    <div onKeyDown={handleKeyDown} role="listbox">
      {options.map((opt, idx) => {
        const isSelected    = selectedValue === opt.value;
        const isHighlighted = idx === highlightIdx && !isSelected;
        return (
          <div key={opt.value} role="option" aria-selected={isSelected}
            onClick={() => onSelect(opt.value, opt.label)}
            onMouseEnter={() => setHighlightIdx(idx)}
            className={`px-3 py-2.5 cursor-pointer text-sm flex items-center justify-between transition-colors
                        ${isSelected                    ? 'bg-brand-light text-gray-900' : ''}
                        ${isHighlighted                 ? 'bg-brand-light' : ''}
                        ${!isSelected && !isHighlighted ? 'hover:bg-brand-light' : ''}`}
          >
            <span>{opt.label}</span>
            {isSelected && <span className="text-sm font-semibold ml-2" aria-hidden>✓</span>}
          </div>
        );
      })}
    </div>
  );
}
