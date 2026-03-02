import { forwardRef } from 'react';
import XCloseIcon from '../assets/icons/ui/XClose.svg';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  /** Extra classes on the input element (e.g. rounded-t-[10px] for dropdown top) */
  inputClassName?: string;
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const SearchInput = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, onClear, placeholder = 'Filter...', inputClassName = '' }, ref) => (
    <div className="relative">
      <span className="absolute top-[11px] left-2.5 text-gray-400 pointer-events-none">
        <SearchIcon />
      </span>
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
        className={`w-full pl-[34px] pr-8 py-2 border-b border-gray-200 text-sm
                    outline-none box-border placeholder:text-gray-400 bg-white text-gray-800
                    ${inputClassName}`}
      />
      {value && onClear && (
        <button
          type="button"
          title="Clear"
          onClick={onClear}
          className="absolute top-[7px] right-[7px] w-[22px] h-[22px] flex items-center
                     justify-center rounded-full opacity-55 hover:bg-gray-100 hover:opacity-100
                     border-none bg-transparent cursor-pointer p-0"
        >
          <img src={XCloseIcon} alt="" className="block w-3 h-3" />
        </button>
      )}
    </div>
  ),
);

SearchInput.displayName = 'SearchInput';
