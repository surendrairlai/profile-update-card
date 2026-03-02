import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { MentionNodeAttrs } from '@tiptap/extension-mention';
import type { SuggestionKeyDownProps } from '@tiptap/suggestion';
import type { ExpressionSuggestion, FieldType } from '../types';
import { EXPRESSION_TREE } from '../data/expressions';
import { getFieldIcon } from '../utils/fieldIcons';

type SuggestionItem = MentionNodeAttrs & {
  category?: string;
  fieldType?: FieldType;
};

interface Props {
  items: SuggestionItem[];
  query?: string;
  command: (item: SuggestionItem) => void;
}

interface Section {
  label: string;
  items: ExpressionSuggestion[];
}

function buildSections(extraContact: ExpressionSuggestion[]): Section[] {
  const sections: Section[] = [];
  for (const group of EXPRESSION_TREE) {
    if (group.groups) {
      for (const sub of group.groups) {
        if (sub.items?.length) {
          sections.push({ label: `${group.label} · ${sub.label}`, items: sub.items });
        }
      }
    } else if (group.items?.length) {
      const items =
        group.id === 'contact' && extraContact.length
          ? (() => {
              const existing = new Set(group.items.map((i) => i.id));
              return [...extraContact.filter((e) => !existing.has(e.id)), ...group.items];
            })()
          : group.items;
      sections.push({ label: group.label, items });
    }
  }
  return sections;
}

/**
 * Dual-mode @expression picker:
 *  - Browse mode: grouped sections when no filter is active
 *  - Filter mode: flat filtered list when the internal search bar or TipTap query is active
 */
export const ExpressionSuggestionList = forwardRef<
  { onKeyDown: (args: SuggestionKeyDownProps) => boolean },
  Props
>(({ items, query, command }, ref) => {
  const filterRef = useRef<HTMLInputElement>(null);
  const listRef   = useRef<HTMLDivElement>(null);
  const isTipTapSearch = !!(query?.trim());

  const [filterText, setFilterText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevIsTipTapSearch, setPrevIsTipTapSearch] = useState(isTipTapSearch);

  if (prevIsTipTapSearch !== isTipTapSearch) {
    setPrevIsTipTapSearch(isTipTapSearch);
    setFilterText('');
    setSelectedIndex(0);
  }

  const extraContact: ExpressionSuggestion[] = useMemo(
    () =>
      items
        .filter((i) => i.category === 'Contact')
        .map((i) => ({
          id: i.id ?? '',
          label: i.label ?? '',
          category: 'Contact',
          fieldType: (i.fieldType ?? 'text') as FieldType,
        })),
    [items]
  );

  const sections = useMemo(() => buildSections(extraContact), [extraContact]);

  const flatItems: ExpressionSuggestion[] = useMemo(() => {
    if (isTipTapSearch) {
      return items.map((i) => ({
        id: i.id ?? '',
        label: i.label ?? '',
        category: i.category ?? '',
        fieldType: (i.fieldType ?? 'text') as FieldType,
      }));
    }
    const q = filterText.trim().toLowerCase();
    if (!q) return [];
    return sections
      .flatMap((s) => s.items)
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
  }, [isTipTapSearch, filterText, items, sections]);

  const isFilterActive = isTipTapSearch || !!filterText.trim();

  const activeList = useMemo(() => isFilterActive ? flatItems : [], [isFilterActive, flatItems]);
  const safeIndex = selectedIndex >= activeList.length ? 0 : selectedIndex;

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-sel="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [safeIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: SuggestionKeyDownProps) => {
      const key = event.key;

      if (isFilterActive) {
        if (key === 'ArrowUp')   { setSelectedIndex((i) => Math.max(0, i - 1));                     return true; }
        if (key === 'ArrowDown') { setSelectedIndex((i) => Math.min(activeList.length - 1, i + 1)); return true; }
        if (key === 'Enter') {
          const item = activeList[safeIndex];
          if (item) command(item as SuggestionItem);
          return true;
        }
        return false;
      }

      return false;
    },
  }), [isFilterActive, activeList, safeIndex, command]);

  if (isTipTapSearch && items.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-[10px] shadow-xl overflow-hidden w-[300px] max-w-[90vw]">

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-gray-400 shrink-0">
          <path d="M21 21l-4.35-4.35M17.5 11.5a6 6 0 11-12 0 6 6 0 0112 0z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          ref={filterRef}
          type="text"
          placeholder="Filter..."
          value={filterText}
          onChange={(e) => { setFilterText(e.target.value); setSelectedIndex(0); }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Escape') setFilterText('');
          }}
          className="flex-1 text-[13px] text-gray-800 outline-none placeholder:text-gray-400 bg-transparent border-none"
        />
        {filterText && (
          <button
            type="button"
            onClick={() => { setFilterText(''); filterRef.current?.focus(); }}
            className="text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer p-0 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      <div ref={listRef} className="max-h-[320px] overflow-y-auto">

        {/* Flat filtered results */}
        {isFilterActive && (
          <>
            {flatItems.length === 0 ? (
              <div className="px-3 py-5 text-[13px] text-gray-400 text-center">
                {`No results for "${filterText || query}"`}
              </div>
            ) : (
              <div className="py-1">
                {flatItems.map((item, index) => {
                  const icon = getFieldIcon({ id: item.id, type: item.fieldType });
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-sel={index === safeIndex}
                      onClick={() => command(item as SuggestionItem)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[13px]
                                   text-gray-800 border-none cursor-pointer transition-colors
                                   ${index === safeIndex ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <img src={icon} alt="" className="block w-4 h-4 shrink-0 opacity-60" />
                      <span className="truncate">
                        {item.category && (
                          <span className="text-gray-400 text-[12px]">{item.category} › </span>
                        )}
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Browse mode: grouped sections */}
        {!isFilterActive && (
          <>
            {sections.map((section) => (
              <div key={section.label}>
                <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {section.label}
                </div>
                {section.items.map((item) => {
                  const icon = getFieldIcon({ id: item.id, type: item.fieldType });
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => command(item as SuggestionItem)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px]
                                 text-gray-800 border-none cursor-pointer bg-white hover:bg-gray-50
                                 transition-colors"
                    >
                      <img src={icon} alt="" className="block w-4 h-4 shrink-0 opacity-60" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
            <div className="h-2" />
          </>
        )}
      </div>
    </div>
  );
});

ExpressionSuggestionList.displayName = 'ExpressionSuggestionList';
