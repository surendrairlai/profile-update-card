import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention, { type MentionNodeAttrs } from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import type { SuggestionKeyDownProps, SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import { ExpressionSuggestionList } from './ExpressionSuggestion';
import { getExpressionSuggestions } from '../data/expressions';
import { BooleanPicker } from './BooleanPicker';
import { DatePicker } from './DatePicker';
import { EnumPicker } from './EnumPicker';
import type { FieldDefinition } from '../types';
import AtSignIcon   from '../assets/icons/ui/AtSign.svg';
import XCloseIcon   from '../assets/icons/ui/XClose.svg';
import ChevronDownIcon from '../assets/icons/ui/ChevronDown.svg';
import CalendarIcon from '../assets/icons/ui/Calendar.svg';

type MentionCommand = { onKeyDown: (args: SuggestionKeyDownProps) => boolean };

interface Props {
  field: FieldDefinition | null;
  rawValue: string;
  displayValue: string;
  isPickedValue: boolean;
  onValueChange: (rawValue: string, displayValue: string, isPicked: boolean) => void;
  onClear: () => void;
}

export function ValueEditor({ field, rawValue, displayValue, isPickedValue, onValueChange, onClear }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setShowPicker(false);
    };
    // capture: true fires before React Flow's own handlers
    document.addEventListener('mousedown', handler, { capture: true });
    return () => document.removeEventListener('mousedown', handler, { capture: true });
  }, []);

  // When the user types "@", TipTap fires the mention suggestion plugin which
  // renders ExpressionSuggestionList in a Tippy popup, filtered by the query.
  const mentionSuggestion = useMemo<Omit<SuggestionOptions<MentionNodeAttrs, MentionNodeAttrs>, 'editor'>>(
    () => ({
      items: ({ query }) => getExpressionSuggestions(query, field),
      render: () => {
        let component: ReactRenderer | null = null;
        let popup: TippyInstance | null = null;

        return {
          onStart(props: SuggestionProps<MentionNodeAttrs, MentionNodeAttrs>) {
            component = new ReactRenderer(ExpressionSuggestionList, {
              props: { ...props, query: props.query },
              editor: props.editor,
            });
            const rect = props.clientRect?.();
            if (!rect) return;
            popup = tippy(document.body, {
              getReferenceClientRect: () => rect,
              appendTo: () => document.body,
              content: component!.element,
              showOnCreate: true, interactive: true, trigger: 'manual', placement: 'bottom-start',
              maxWidth: 'none',
            });
          },
          onUpdate(props: SuggestionProps<MentionNodeAttrs, MentionNodeAttrs>) {
            component?.updateProps({ ...props, query: props.query });
            const rect = props.clientRect?.();
            if (rect) popup?.setProps({ getReferenceClientRect: () => rect });
          },
          onKeyDown(props: SuggestionKeyDownProps) {
            if (props.event.key === 'Escape') { popup?.hide(); return true; }
            return (component?.ref as MentionCommand | null)?.onKeyDown?.(props) ?? false;
          },
          onExit() {
            popup?.destroy(); component?.destroy();
          },
        };
      },
    }),
    [field]
  );

  // key={field?.id} in the parent forces a full remount when the field changes,
  // so we don't need to imperatively reset the ProseMirror state here.
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: false, bulletList: false, orderedList: false,
          blockquote: false, codeBlock: false, horizontalRule: false,
        }),
        Placeholder.configure({ placeholder: field ? 'e.g @contact.name' : '' }),
        Mention.configure({
          HTMLAttributes: { class: 'mention' },
          suggestion: mentionSuggestion,
          renderText: ({ node }) => `@${node.attrs.id}`,
        }),
      ],
      editable: !!field && !isPickedValue,
      onUpdate: ({ editor: ed }) => {
        if (!field || isPickedValue) return;
        const text = ed.getText();
        onValueChange(text, text, false);
      },
    },
    [field?.id, isPickedValue]
  );

  // Inserting "@" programmatically is the same as the user typing it — triggers the mention popup.
  const insertAtTrigger = useCallback(() => {
    if (!editor || !field) return;
    editor.chain().focus().insertContent('@').run();
  }, [editor, field]);

  const handleClear = useCallback(() => {
    setShowPicker(false);
    onClear();
  }, [onClear]);

  const handlePickerSelect = useCallback(
    (rawValue: string, displayValue: string) => {
      onValueChange(rawValue, displayValue, true);
      setShowPicker(false);
    },
    [onValueChange]
  );

  const closePicker = useCallback(() => setShowPicker(false), []);

  const hasPickerButton = !!field && field.type !== 'text';
  const pickerIcon = field?.type === 'date' ? CalendarIcon : ChevronDownIcon;

  return (
    <div
      ref={wrapperRef}
      className={`flex items-start border border-gray-300 rounded-lg p-0.5 min-h-[38px]
                  relative transition-all
                  focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15
                  ${!field ? 'bg-gray-100' : 'bg-white'}`}
    >
      {isPickedValue ? (
        <div className="flex-1 min-w-0 px-2 py-1.5 text-sm text-gray-800
                        overflow-hidden text-ellipsis whitespace-nowrap self-center leading-snug">
          {displayValue}
        </div>
      ) : (
        <div className={`flex-1 min-w-0 ${!field ? 'pointer-events-none' : ''}`}>
          <EditorContent editor={editor} />
        </div>
      )}

      {field && (
        <div className="flex items-center gap-0.5 shrink-0 p-0.5">
          {!isPickedValue && (
            <button type="button" onClick={insertAtTrigger} title="Insert @expression"
              className="w-8 h-8 flex items-center justify-center rounded-md cursor-pointer
                         text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all
                         border-none bg-transparent">
              <img src={AtSignIcon} alt="@" className="block w-[18px] h-[18px] opacity-70" />
            </button>
          )}

          {isPickedValue && (
            <button type="button" onClick={handleClear} title="Clear value" aria-label="Clear selected value"
              className="w-8 h-8 flex items-center justify-center rounded-md cursor-pointer
                         text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all
                         border-none bg-transparent">
              <img src={XCloseIcon} alt="clear" className="block w-[18px] h-[18px] opacity-70" />
            </button>
          )}

          {hasPickerButton && (
            <div className="relative">
              <button type="button" onClick={() => setShowPicker((v) => !v)} title="Pick a value"
                className={`w-8 h-8 flex items-center justify-center rounded-md cursor-pointer
                             transition-all border-none
                             ${showPicker ? 'bg-blue-50 text-blue-500' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 bg-transparent'}`}>
                <img src={pickerIcon} alt="" className="block w-[18px] h-[18px] opacity-70" />
              </button>

              {showPicker && (
                <div
                  className="absolute top-[calc(100%+4px)] right-0 bg-white border border-gray-200
                              rounded-[10px] shadow-xl z-1500 min-w-[220px] max-w-[90vw] overflow-hidden
                              nodrag nopan nowheel"
                  onWheel={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {field.type === 'boolean' && (
                    <BooleanPicker options={field.options ?? []} selectedValue={rawValue}
                      onSelect={handlePickerSelect} onClose={closePicker} />
                  )}
                  {field.type === 'date' && (
                    <DatePicker onSelect={handlePickerSelect} />
                  )}
                  {field.type === 'enum' && (
                    <EnumPicker options={field.options ?? []} selectedValue={rawValue}
                      onSelect={handlePickerSelect} onClose={closePicker} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
