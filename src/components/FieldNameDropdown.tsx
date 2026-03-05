import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { FieldDefinition, FieldType } from '../types';
import { getFieldIcon } from '../utils/fieldIcons';
import { SearchInput } from './SearchInput';
import ChevronDownIcon from '../assets/icons/ui/ChevronDown.svg';
import XCloseIcon from '../assets/icons/ui/XClose.svg';

interface Props {
  fields: FieldDefinition[];
  selectedField: FieldDefinition | null;
  onChange: (field: FieldDefinition | null) => void;
  onCreateField: (field: FieldDefinition) => void;
}

const TYPE_OPTIONS: { label: string; value: FieldType }[] = [
  { label: 'Text',         value: 'text'    },
  { label: 'True / False', value: 'boolean' },
  { label: 'Date',         value: 'date'    },
  { label: 'Enum',         value: 'enum'    },
];

function toId(name: string) {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

export function FieldNameDropdown({ fields, selectedField, onChange, onCreateField }: Props) {
  const [isOpen, setIsOpen]             = useState(false);
  const [search, setSearch]             = useState('');
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [keyboardMode, setKeyboardMode] = useState(false);

  const [showForm, setShowForm]     = useState(false);
  const [newName, setNewName]       = useState('');
  const [newType, setNewType]       = useState<FieldType>('text');
  const [newOptions, setNewOptions] = useState('');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLInputElement>(null);
  const listRef    = useRef<HTMLDivElement>(null);
  const nameRef    = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? fields.filter((f) => f.label.toLowerCase().includes(q) || f.id.includes(q))
      : fields;
  }, [search, fields]);

  const canSubmit =
    newName.trim().length > 0 &&
    (newType !== 'enum' || newOptions.trim().length > 0);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setIsOpen(false); setSearch(''); setShowForm(false);
      }
    };
    // capture: true fires before React Flow's own mousedown handlers
    document.addEventListener('mousedown', close, { capture: true });
    return () => document.removeEventListener('mousedown', close, { capture: true });
  }, []);

  useEffect(() => { if (isOpen && !showForm) searchRef.current?.focus(); }, [isOpen, showForm]);
  useEffect(() => { if (showForm) nameRef.current?.focus(); }, [showForm]);

  useEffect(() => {
    listRef.current
      ?.querySelectorAll<HTMLElement>('[role="option"]')
      ?.[highlightIdx]
      ?.scrollIntoView({ block: 'nearest' });
  }, [highlightIdx]);

  const selectField = useCallback(
    (field: FieldDefinition) => {
      onChange(field);
      setIsOpen(false); setSearch(''); setKeyboardMode(false); setShowForm(false);
    },
    [onChange]
  );

  const toggleOpen = useCallback(() => {
    setIsOpen((open) => {
      if (!open) {
        const idx = fields.findIndex((f) => f.id === selectedField?.id);
        setHighlightIdx(idx >= 0 ? idx : 0);
      }
      return !open;
    });
    setKeyboardMode(false); setShowForm(false);
  }, [fields, selectedField]);

  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Prevent React Flow from also reacting to these keys
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
        e.stopPropagation();
      }
      if (showForm) return;
      setKeyboardMode(true);
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); setHighlightIdx((i) => (i < filtered.length - 1 ? i + 1 : 0)); break;
        case 'ArrowUp':   e.preventDefault(); setHighlightIdx((i) => (i > 0 ? i - 1 : filtered.length - 1)); break;
        case 'Enter':     e.preventDefault(); if (filtered[highlightIdx]) selectField(filtered[highlightIdx]); break;
        case 'Escape':    e.preventDefault(); setIsOpen(false); setSearch(''); break;
      }
    },
    [filtered, highlightIdx, selectField, showForm]
  );

  const resetForm = useCallback(() => {
    setNewName(''); setNewType('text'); setNewOptions(''); setShowForm(false);
  }, []);

  const submitForm = useCallback(() => {
    const name = newName.trim();
    const id   = toId(name);
    if (!name || !id) return;

    const options: FieldDefinition['options'] =
      newType === 'boolean'
        ? [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]
        : newType === 'enum'
        ? newOptions.split(',').map((s) => s.trim()).filter(Boolean)
            .map((p) => ({ label: p, value: toId(p) }))
        : undefined;

    if (newType === 'enum' && !options?.length) return;

    const field: FieldDefinition = { id, label: name, type: newType, source: 'custom', ...(options ? { options } : {}) };
    onCreateField(field);
    selectField(field);
    resetForm();
  }, [newName, newType, newOptions, onCreateField, selectField, resetForm]);

  const formKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Enter') submitForm();
      if (e.key === 'Escape') resetForm();
    },
    [submitForm, resetForm]
  );

  return (
    <div className="relative" ref={wrapperRef}>

      <button
        type="button"
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm
                   text-gray-800 cursor-pointer flex items-center justify-between
                   transition-colors hover:border-gray-400
                   focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15
                   box-border"
      >
        {selectedField
          ? <span className="font-medium">{selectedField.label}</span>
          : <span className="text-gray-400">Select a field</span>
        }
        <img src={ChevronDownIcon} alt="" className="block w-4 h-4 opacity-60 shrink-0" />
      </button>

      {isOpen && (
        <div
          className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border
                     border-gray-200 rounded-[10px] shadow-xl z-2000 flex flex-col
                     max-h-[min(360px,50dvh)] overflow-y-auto"
          role="listbox"
          onKeyDown={handleListKeyDown}
        >
          {showForm ? (

            <div className="p-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-gray-800">New custom field</span>
                <button type="button" onClick={resetForm} aria-label="Cancel"
                  className="w-[22px] h-[22px] flex items-center justify-center rounded-full
                             opacity-55 hover:bg-gray-100 hover:opacity-100 border-none bg-transparent cursor-pointer p-0">
                  <img src={XCloseIcon} alt="" className="block w-3 h-3" />
                </button>
              </div>

              <label className="flex flex-col gap-1 text-[12px] font-medium text-gray-400">
                Name
                <input
                  ref={nameRef}
                  className="px-2.5 py-[7px] border border-gray-300 rounded-md text-[13px]
                             outline-none focus:border-brand focus:ring-2 focus:ring-brand/10
                             placeholder:text-gray-400 text-gray-800"
                  type="text" placeholder="e.g. Patient ID"
                  value={newName} onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={formKeyDown}
                />
              </label>

              <label className="flex flex-col gap-1 text-[12px] font-medium text-gray-400">
                Type
                <div className="grid grid-cols-2 gap-1">
                  {TYPE_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button"
                      onClick={() => setNewType(opt.value)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 border rounded-md
                                  text-xs cursor-pointer transition-colors
                                  ${newType === opt.value
                                    ? 'border-brand bg-brand-muted text-purple-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                      <img src={getFieldIcon({ id: '', type: opt.value })} alt="" className="block w-3.5 h-3.5" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </label>

              {newType === 'enum' && (
                <label className="flex flex-col gap-1 text-[12px] font-medium text-gray-400">
                  Options <span className="font-normal">(comma-separated)</span>
                  <input
                    className="px-2.5 py-[7px] border border-gray-300 rounded-md text-[13px]
                               outline-none focus:border-brand focus:ring-2 focus:ring-brand/10
                               placeholder:text-gray-400 text-gray-800"
                    type="text" placeholder="Option A, Option B"
                    value={newOptions} onChange={(e) => setNewOptions(e.target.value)}
                    onKeyDown={formKeyDown}
                  />
                </label>
              )}

              <button type="button" onClick={submitForm} disabled={!canSubmit}
                className="px-3 py-2 rounded-md bg-brand text-white text-[13px] font-medium
                           cursor-pointer hover:bg-brand-dark transition-colors
                           disabled:bg-gray-300 disabled:cursor-not-allowed border-none">
                Add field
              </button>
            </div>

          ) : (

            <>
              <SearchInput
                ref={searchRef}
                value={search}
                inputClassName="rounded-t-[10px]"
                onChange={(val) => { setSearch(val); setHighlightIdx(0); setKeyboardMode(false); }}
                onClear={() => { setSearch(''); setHighlightIdx(0); searchRef.current?.focus(); }}
              />

              <div className="overflow-y-auto" ref={listRef} onMouseMove={() => setKeyboardMode(false)}>
                {filtered.length === 0 ? (
                  <div className="px-3 py-4 text-center text-gray-400 text-[13px]">No fields found</div>
                ) : (
                  filtered.map((field, idx) => {
                    const isSelected    = selectedField?.id === field.id;
                    const isHighlighted = idx === highlightIdx && keyboardMode;
                    return (
                      <div key={field.id} role="option" aria-selected={isSelected}
                        onClick={() => selectField(field)}
                        onMouseEnter={() => setHighlightIdx(idx)}
                        className={`px-3 py-2 cursor-pointer text-sm text-gray-800 flex items-center
                                    justify-between transition-colors
                                    ${isSelected                      ? 'bg-brand-light text-gray-900!' : ''}
                                    ${isHighlighted                   ? 'bg-brand-light' : ''}
                                    ${!isSelected && !isHighlighted   ? 'hover:bg-brand-light' : ''}`}
                      >
                        <span className="inline-flex items-center gap-2 min-w-0 overflow-hidden">
                          <img src={getFieldIcon(field)} alt="" className="block w-4 h-4 shrink-0 opacity-70" />
                          <span className="truncate">{field.label}</span>
                        </span>
                        {isSelected && <span className="text-sm font-semibold ml-2 shrink-0" aria-hidden>✓</span>}
                      </div>
                    );
                  })
                )}
              </div>

              <button type="button" onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 w-full px-3 py-2.5 border-t border-gray-200
                           text-[13px] font-medium text-brand cursor-pointer
                           hover:bg-brand-muted transition-colors bg-transparent border-x-0 border-b-0">
                <span className="w-[18px] h-[18px] flex items-center justify-center bg-brand-light
                                 rounded text-brand font-semibold text-sm leading-none">
                  +
                </span>
                Create custom field
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
