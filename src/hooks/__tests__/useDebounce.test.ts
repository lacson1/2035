import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('returns debounced value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Initial value
    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'changed', delay: 500 });

    // Value should still be initial (not yet debounced)
    expect(result.current).toBe('initial');

    // Advance timer
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now value should be debounced
    expect(result.current).toBe('changed');
  });

  it('cancels previous timeout when value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    // Change value quickly (before debounce delay)
    rerender({ value: 'second', delay: 500 });

    // Advance timer partially
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Value should still be first
    expect(result.current).toBe('first');

    // Advance timer to complete second debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Now value should be second
    expect(result.current).toBe('second');
  });

  it('handles delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 1000 } }
    );

    // Change delay to shorter time
    rerender({ value: 'test', delay: 200 });

    // Advance timer for new delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should debounce with new delay
    expect(result.current).toBe('test');
  });

  it('works with different data types', () => {
    // Test with number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 42, delay: 300 } }
    );

    numberRerender({ value: 100, delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(numberResult.current).toBe(100);

    // Test with object
    const obj1 = { name: 'John' };
    const obj2 = { name: 'Jane' };

    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: obj1, delay: 300 } }
    );

    objectRerender({ value: obj2, delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(objectResult.current).toBe(obj2);

    // Test with array
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];

    const { result: arrayResult, rerender: arrayRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: arr1, delay: 300 } }
    );

    arrayRerender({ value: arr2, delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(arrayResult.current).toBe(arr2);
  });

  it('cleans up timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useDebounce('test', 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('handles zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );

    rerender({ value: 'changed', delay: 0 });

    // With zero delay, should update immediately (next tick)
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('changed');
  });

  it('handles rapid consecutive changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 200 } }
    );

    // Rapid changes
    rerender({ value: 'second', delay: 200 });
    rerender({ value: 'third', delay: 200 });
    rerender({ value: 'fourth', delay: 200 });

    // Advance timer
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should only debounce the last value
    expect(result.current).toBe('fourth');
  });
});
