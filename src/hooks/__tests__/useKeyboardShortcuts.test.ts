import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

// Mock the contexts
const mockSetSelectedPatient = vi.fn();
const mockSetActiveTab = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastInfo = vi.fn();

vi.mock('../../context/DashboardContext', () => ({
  useDashboard: () => ({
    patients: [
      { id: '1', name: 'John Doe', firstName: 'John', lastName: 'Doe' },
      { id: '2', name: 'Jane Smith', firstName: 'Jane', lastName: 'Smith' },
      { id: '3', name: 'Bob Johnson', firstName: 'Bob', lastName: 'Johnson' }
    ],
    selectedPatient: { id: '2', name: 'Jane Smith', firstName: 'Jane', lastName: 'Smith' },
    setSelectedPatient: mockSetSelectedPatient,
    setActiveTab: mockSetActiveTab,
  }),
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    info: mockToastInfo,
  }),
}));

describe('useKeyboardShortcuts', () => {
  let addEventListenerSpy: vi.SpyInstance;
  let removeEventListenerSpy: vi.SpyInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock document event listeners
    addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    // Mock querySelector for search focus
    vi.spyOn(document, 'querySelector').mockReturnValue({
      focus: vi.fn(),
      select: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns shortcuts and showHelp function', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());

    expect(result.current).toHaveProperty('shortcuts');
    expect(result.current).toHaveProperty('showHelp');
    expect(Array.isArray(result.current.shortcuts)).toBe(true);
    expect(result.current.shortcuts.length).toBeGreaterThan(0);
    expect(typeof result.current.showHelp).toBe('function');
  });

  it('adds and removes event listeners on mount/unmount', () => {
    const { unmount } = renderHook(() => useKeyboardShortcuts());

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('handles Ctrl+ArrowLeft for previous patient', () => {
    renderHook(() => useKeyboardShortcuts());

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      ctrlKey: true,
    });

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    expect(mockSetSelectedPatient).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', name: 'John Doe' })
    );
    expect(mockToastSuccess).toHaveBeenCalledWith('Selected patient: John Doe');
  });

  it('handles Ctrl+ArrowRight for next patient', () => {
    renderHook(() => useKeyboardShortcuts());

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      ctrlKey: true,
    });

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    expect(mockSetSelectedPatient).toHaveBeenCalledWith(
      expect.objectContaining({ id: '3', name: 'Bob Johnson' })
    );
    expect(mockToastSuccess).toHaveBeenCalledWith('Selected patient: Bob Johnson');
  });

  it('wraps to first patient when going right from last patient', () => {
    // Mock context with last patient selected
    vi.mocked(vi.importMock('../../context/DashboardContext')).useDashboard.mockReturnValue({
      patients: [
        { id: '1', name: 'John Doe', firstName: 'John', lastName: 'Doe' },
        { id: '2', name: 'Jane Smith', firstName: 'Jane', lastName: 'Smith' },
        { id: '3', name: 'Bob Johnson', firstName: 'Bob', lastName: 'Johnson' }
      ],
      selectedPatient: { id: '3', name: 'Bob Johnson', firstName: 'Bob', lastName: 'Johnson' },
      setSelectedPatient: mockSetSelectedPatient,
      setActiveTab: mockSetActiveTab,
    });

    renderHook(() => useKeyboardShortcuts());

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      ctrlKey: true,
    });

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    expect(mockSetSelectedPatient).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', name: 'John Doe' })
    );
  });

  it('wraps to last patient when going left from first patient', () => {
    // Mock context with first patient selected
    vi.mocked(vi.importMock('../../context/DashboardContext')).useDashboard.mockReturnValue({
      patients: [
        { id: '1', name: 'John Doe', firstName: 'John', lastName: 'Doe' },
        { id: '2', name: 'Jane Smith', firstName: 'Jane', lastName: 'Smith' },
        { id: '3', name: 'Bob Johnson', firstName: 'Bob', lastName: 'Johnson' }
      ],
      selectedPatient: { id: '1', name: 'John Doe', firstName: 'John', lastName: 'Doe' },
      setSelectedPatient: mockSetSelectedPatient,
      setActiveTab: mockSetActiveTab,
    });

    renderHook(() => useKeyboardShortcuts());

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      ctrlKey: true,
    });

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    expect(mockSetSelectedPatient).toHaveBeenCalledWith(
      expect.objectContaining({ id: '3', name: 'Bob Johnson' })
    );
  });

  it('handles Ctrl+N for new consultation note', () => {
    renderHook(() => useKeyboardShortcuts());

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
    });

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    expect(mockSetActiveTab).toHaveBeenCalledWith('consultation');
    expect(mockToastSuccess).toHaveBeenCalledWith('Switched to consultation for new note');
  });

  it('handles Ctrl+Shift+M for medications', () => {
    renderHook(() => useKeyboardShortcuts());

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'm',
      ctrlKey: true,
      shiftKey: true,
    });

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    expect(mockSetActiveTab).toHaveBeenCalledWith('medications');
    expect(mockToastSuccess).toHaveBeenCalledWith('Switched to medications');
  });

  it('handles Ctrl+L for lab results', () => {
    renderHook(() => useKeyboardShortcuts());

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'l',
      ctrlKey: true,
    });

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    expect(mockSetActiveTab).toHaveBeenCalledWith('labs');
    expect(mockToastSuccess).toHaveBeenCalledWith('Switched to labs');
  });

  it('handles Ctrl+1 through Ctrl+5 for tab navigation', () => {
    renderHook(() => useKeyboardShortcuts());

    const tabs = [
      { key: '1', tab: 'overview', message: 'Switched to overview' },
      { key: '2', tab: 'consultation', message: 'Switched to consultation' },
      { key: '3', tab: 'medications', message: 'Switched to medications' },
      { key: '4', tab: 'labs', message: 'Switched to labs' },
      { key: '5', tab: 'timeline', message: 'Switched to timeline' },
    ];

    tabs.forEach(({ key, tab, message }) => {
      const keydownEvent = new KeyboardEvent('keydown', {
        key,
        ctrlKey: true,
      });

      act(() => {
        document.dispatchEvent(keydownEvent);
      });

      expect(mockSetActiveTab).toHaveBeenCalledWith(tab);
      expect(mockToastSuccess).toHaveBeenCalledWith(message);
    });
  });

  it('handles Ctrl+K for search focus', () => {
    const mockFocus = vi.fn();
    const mockSelect = vi.fn();

    vi.spyOn(document, 'querySelector').mockReturnValue({
      focus: mockFocus,
      select: mockSelect,
    } as any);

    renderHook(() => useKeyboardShortcuts());

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    expect(mockFocus).toHaveBeenCalled();
    expect(mockSelect).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith('Search focused');
  });

  it('handles Ctrl+R for page refresh', () => {
    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

    renderHook(() => useKeyboardShortcuts());

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'r',
      ctrlKey: true,
    });

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    expect(window.location.reload).toHaveBeenCalled();

    reloadSpy.mockRestore();
  });

  it('handles Shift+/ for keyboard shortcuts help', () => {
    renderHook(() => useKeyboardShortcuts());

    const keydownEvent = new KeyboardEvent('keydown', {
      key: '/',
      shiftKey: true,
    });

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    expect(mockToastInfo).toHaveBeenCalledWith(
      expect.stringContaining('Keyboard Shortcuts:'),
      { duration: 10000 }
    );
  });

  it('ignores keyboard events when typing in input fields', () => {
    renderHook(() => useKeyboardShortcuts());

    // Create a mock input element
    const mockInput = document.createElement('input');
    document.body.appendChild(mockInput);

    // Focus the input
    mockInput.focus();

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      ctrlKey: true,
    });

    // Set the event target to the input
    Object.defineProperty(keydownEvent, 'target', { value: mockInput });

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    // Should not trigger any actions
    expect(mockSetSelectedPatient).not.toHaveBeenCalled();

    document.body.removeChild(mockInput);
  });

  it('ignores keyboard events when typing in textarea', () => {
    renderHook(() => useKeyboardShortcuts());

    const mockTextarea = document.createElement('textarea');
    document.body.appendChild(mockTextarea);
    mockTextarea.focus();

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
    });

    Object.defineProperty(keydownEvent, 'target', { value: mockTextarea });

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    expect(mockSetActiveTab).not.toHaveBeenCalled();

    document.body.removeChild(mockTextarea);
  });

  it('ignores keyboard events when typing in contenteditable elements', () => {
    renderHook(() => useKeyboardShortcuts());

    const mockDiv = document.createElement('div');
    mockDiv.contentEditable = 'true';
    document.body.appendChild(mockDiv);
    mockDiv.focus();

    const keydownEvent = new KeyboardEvent('keydown', {
      key: '1',
      ctrlKey: true,
    });

    Object.defineProperty(keydownEvent, 'target', { value: mockDiv });

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    expect(mockSetActiveTab).not.toHaveBeenCalled();

    document.body.removeChild(mockDiv);
  });

  it('prevents default behavior for matched shortcuts', () => {
    renderHook(() => useKeyboardShortcuts());

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      ctrlKey: true,
    });

    const preventDefaultSpy = vi.spyOn(keydownEvent, 'preventDefault');

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('does not prevent default for unmatched key combinations', () => {
    renderHook(() => useKeyboardShortcuts());

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
    });

    const preventDefaultSpy = vi.spyOn(keydownEvent, 'preventDefault');

    act(() => {
      document.dispatchEvent(keydownEvent);
    });

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('showHelp displays categorized shortcuts', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());

    act(() => {
      result.current.showHelp();
    });

    expect(mockToastInfo).toHaveBeenCalledWith(
      expect.stringContaining('Navigation:'),
      expect.any(Object)
    );
    expect(mockToastInfo).toHaveBeenCalledWith(
      expect.stringContaining('Actions:'),
      expect.any(Object)
    );
    expect(mockToastInfo).toHaveBeenCalledWith(
      expect.stringContaining('Tabs:'),
      expect.any(Object)
    );
  });

  it('does not crash when no patients are available', () => {
    // Mock context with no patients
    vi.mocked(vi.importMock('../../context/DashboardContext')).useDashboard.mockReturnValue({
      patients: [],
      selectedPatient: null,
      setSelectedPatient: mockSetSelectedPatient,
      setActiveTab: mockSetActiveTab,
    });

    renderHook(() => useKeyboardShortcuts());

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      ctrlKey: true,
    });

    // Should not crash
    expect(() => {
      act(() => {
        document.dispatchEvent(keydownEvent);
      });
    }).not.toThrow();

    expect(mockSetSelectedPatient).not.toHaveBeenCalled();
  });

  it('does not crash when no patient is selected', () => {
    // Mock context with patients but no selection
    vi.mocked(vi.importMock('../../context/DashboardContext')).useDashboard.mockReturnValue({
      patients: [
        { id: '1', name: 'John Doe', firstName: 'John', lastName: 'Doe' }
      ],
      selectedPatient: null,
      setSelectedPatient: mockSetSelectedPatient,
      setActiveTab: mockSetActiveTab,
    });

    renderHook(() => useKeyboardShortcuts());

    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      ctrlKey: true,
    });

    expect(() => {
      act(() => {
        document.dispatchEvent(keydownEvent);
      });
    }).not.toThrow();

    expect(mockSetSelectedPatient).not.toHaveBeenCalled();
  });
});
