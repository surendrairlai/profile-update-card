import { renderHook, act } from '@testing-library/react';
import { usePickerKeyboard } from '../usePickerKeyboard';
import type React from 'react';

const items = [
  { label: 'simon', value: 'a' },
  { label: 'arjen', value: 'b' },
  { label: 'surendra', value: 'c' },
];

function key(k: string) {
  return { key: k, preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as React.KeyboardEvent;
}

describe('usePickerKeyboard', () => {
  it('arrows move highlight up and down', () => {
    const { result } = renderHook(() => usePickerKeyboard(items, vi.fn()));

    act(() => result.current.handleKeyDown(key('ArrowDown')));
    expect(result.current.highlightIdx).toBe(0);

    act(() => result.current.handleKeyDown(key('ArrowDown')));
    expect(result.current.highlightIdx).toBe(1);

    act(() => result.current.handleKeyDown(key('ArrowUp')));
    expect(result.current.highlightIdx).toBe(0);
  });

  it('wraps around both ends', () => {
    const { result } = renderHook(() => usePickerKeyboard(items, vi.fn()));

    act(() => result.current.handleKeyDown(key('ArrowUp')));
    expect(result.current.highlightIdx).toBe(2);

    act(() => result.current.handleKeyDown(key('ArrowDown')));
    expect(result.current.highlightIdx).toBe(0);
  });

  it('enter selects, escape closes', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() => usePickerKeyboard(items, onSelect, onClose));

    act(() => result.current.handleKeyDown(key('ArrowDown')));
    act(() => result.current.handleKeyDown(key('Enter')));
    expect(onSelect).toHaveBeenCalledWith('a', 'simon');

    act(() => result.current.handleKeyDown(key('Escape')));
    expect(onClose).toHaveBeenCalled();
  });

  it('resets when items list changes', () => {
    const { result, rerender } = renderHook(
      ({ list }) => usePickerKeyboard(list, vi.fn()),
      { initialProps: { list: items } },
    );

    act(() => result.current.handleKeyDown(key('ArrowDown')));
    expect(result.current.highlightIdx).toBe(0);

    rerender({ list: [{ label: 'New', value: 'n' }] });
    expect(result.current.highlightIdx).toBe(-1);
  });
});
