import { memo, useCallback, useMemo, useState } from 'react';
import { Handle, Position, useReactFlow, useEdges, type NodeProps } from '@xyflow/react';
import { FieldNameDropdown } from './FieldNameDropdown';
import { ValueEditor } from './ValueEditor';
import { Confetti } from './Confetti';
import { ALL_FIELDS } from '../data/fields';
import type { FieldDefinition, CardState } from '../types';
import UserIcon      from '../assets/icons/ui/User_01.svg';
import InfoCircleIcon from '../assets/icons/ui/InfoCircle.svg';

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ToolbarButtons({ onDuplicate, onDelete }: { onDuplicate: () => void; onDelete: () => void }) {
  return (
    <>
      <button type="button" onClick={onDuplicate} title="Duplicate card" aria-label="Duplicate card"
        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500
                   hover:bg-gray-100 hover:text-gray-700 transition-colors border-none bg-transparent cursor-pointer">
        <CopyIcon />
      </button>
      <button type="button" onClick={onDelete} title="Delete card" aria-label="Delete card"
        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500
                   hover:bg-red-50 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer">
        <TrashIcon />
      </button>
    </>
  );
}

const EMPTY_STATE: CardState = {
  selectedField: null,
  rawValue: '',
  displayValue: '',
  isPickedValue: false,
};

export const UpdateContactFieldNode = memo(({ id, selected, positionAbsoluteX, positionAbsoluteY }: NodeProps) => {
  const [state, setState]               = useState<CardState>(EMPTY_STATE);
  const [customFields, setCustomFields] = useState<FieldDefinition[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const { setNodes, setEdges, deleteElements } = useReactFlow();
  const edges = useEdges();
  const hasOutgoingEdge = useMemo(() => edges.some((e) => e.source === id), [edges, id]);

  const allFields = useMemo(
    () => [...ALL_FIELDS, ...customFields],
    [customFields]
  );

  const save = useCallback(
    (event: string, payload: Record<string, unknown>) =>
      console.log(`[node:${id}] ${event}`, payload),
    [id]
  );

  const handleFieldChange = useCallback(
    (field: FieldDefinition | null) => {
      setState({ selectedField: field, rawValue: '', displayValue: '', isPickedValue: false });
      save('field_changed', { fieldId: field?.id ?? null, fieldType: field?.type ?? null });
    },
    [save]
  );

  const handleCreateField = useCallback(
    (field: FieldDefinition) => {
      setCustomFields((prev) => [...prev, field]);
      save('custom_field_created', { fieldId: field.id, fieldType: field.type });
    },
    [save]
  );

  // rawValue     → stored in DB    (e.g. "true", ISO 8601 date, ISO 639-3 code)
  // displayValue → shown to user   (e.g. "Yes", "04/02/2026", "English")
  const handleValueChange = useCallback(
    (rawValue: string, displayValue: string, isPicked: boolean) => {
      setState((prev) => ({ ...prev, rawValue, displayValue, isPickedValue: isPicked }));
      save('value_changed', { fieldId: state.selectedField?.id, rawValue, displayValue, isPicked });

      if (state.selectedField?.id === 'birthday' && isPicked) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        if (displayValue === `${dd}/${mm}/${yyyy}`) setShowConfetti(true);
      }
    },
    [save, state.selectedField]
  );

  const handleClearValue = useCallback(() => {
    setState((prev) => ({ ...prev, rawValue: '', displayValue: '', isPickedValue: false }));
    save('value_cleared', { fieldId: state.selectedField?.id });
  }, [save, state.selectedField]);

  const handleAddNext = useCallback(() => {
    const newId = `node-${Date.now()}`;
    setNodes((nds) => [...nds, {
      id: newId,
      type: 'updateContactField',
      position: { x: positionAbsoluteX + 370, y: positionAbsoluteY },
      data: {},
    }]);
    setEdges((eds) => [...eds, { id: `${id}→${newId}`, source: id, target: newId }]);
  }, [id, positionAbsoluteX, positionAbsoluteY, setNodes, setEdges]);

  const handleDuplicate = useCallback(() => {
    const newId = `node-${Date.now()}`;
    setNodes((nds) => [...nds, {
      id: newId,
      type: 'updateContactField',
      position: { x: positionAbsoluteX + 40, y: positionAbsoluteY + 40 },
      data: {},
    }]);
    save('duplicated', { newId });
  }, [positionAbsoluteX, positionAbsoluteY, setNodes, save]);

  const handleDelete = useCallback(() => {
    deleteElements({ nodes: [{ id }] });
  }, [id, deleteElements]);

  return (
    // stopPropagation prevents React Flow from stealing keyboard events while
    // the user types in inputs or navigates dropdowns inside the card.
    <div
      className="relative text-sm w-[calc(100vw-32px)] sm:w-[332px] overflow-visible"
      onKeyDown={(e) => e.stopPropagation()}
    >

      {/* Floating toolbar — desktop (sm+); moves inside the card header on mobile */}
      {selected && (
        <div className="hidden sm:flex absolute -top-10 right-0 items-center gap-1
                        bg-white border border-gray-200 rounded-lg shadow-md px-1 py-1">
          <ToolbarButtons onDuplicate={handleDuplicate} onDelete={handleDelete} />
        </div>
      )}

      <div className="bg-white border-2 border-brand rounded-xl shadow-sm relative">
        {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />

        {/* + button sits top-right outside the card; disabled once an edge is connected. */}
        <button
          type="button"
          onClick={handleAddNext}
          disabled={hasOutgoingEdge}
          aria-label="Add next card"
          title={hasOutgoingEdge ? 'Already connected' : 'Add next card'}
          className={`absolute top-3 -right-8 w-6 h-6 rounded-full
                     flex items-center justify-center text-lg font-light
                     leading-none z-10 border shadow-sm transition-colors focus:outline-none
                     ${hasOutgoingEdge
                       ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                       : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer'}`}
        >
          +
        </button>

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50
                        border-b border-gray-200 rounded-t-xl font-semibold text-[13px] text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-[22px] h-[22px] bg-brand-icon rounded-md flex items-center justify-center shrink-0">
              <img src={UserIcon} alt="" className="block w-3.5 h-3.5 opacity-90" />
            </div>
            Update profile field
          </div>

          <div className="flex items-center gap-1">
            {/* Mobile toolbar — hidden on sm+ where the floating version shows */}
            {selected && (
              <div className="sm:hidden flex items-center gap-1">
                <ToolbarButtons onDuplicate={handleDuplicate} onDelete={handleDelete} />
              </div>
            )}

            <div className="relative group">
              <button type="button" aria-label="Card info"
                className="w-5 h-5 flex items-center justify-center opacity-50 bg-transparent border-none cursor-default p-0">
                <img src={InfoCircleIcon} alt="" className="block w-4 h-4" />
              </button>
              <div className="absolute right-0 bottom-[calc(100%+6px)] w-[200px] bg-white border border-gray-200
                              rounded-lg shadow-xl p-3 text-[12px] font-normal text-gray-600 leading-relaxed
                              hidden group-hover:block z-3000 pointer-events-none">
                Update a contact&apos;s details. Select a profile field and enter a value.
                Type &apos;@&apos; to write a dynamic expression.
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-3 flex flex-col gap-2.5">
          <div>
            <div className="text-[13px] font-medium text-gray-400 mb-1">Field</div>
            <FieldNameDropdown
              fields={allFields}
              selectedField={state.selectedField}
              onChange={handleFieldChange}
              onCreateField={handleCreateField}
            />
          </div>

          <div>
            <div className="text-[13px] font-medium text-gray-400 mb-1">Value</div>
            {/*
              key forces a TipTap remount when the field changes,
              cleanly resetting the editor without imperative ProseMirror calls.
            */}
            <ValueEditor
              key={state.selectedField?.id ?? 'no-field'}
              field={state.selectedField}
              rawValue={state.rawValue}
              displayValue={state.displayValue}
              isPickedValue={state.isPickedValue}
              onValueChange={handleValueChange}
              onClear={handleClearValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

UpdateContactFieldNode.displayName = 'UpdateContactFieldNode';
