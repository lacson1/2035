import { useEffect, useCallback } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Cmd on Mac
  action: () => void;
  description: string;
  category?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        (target as HTMLInputElement).type === "text" ||
        (target as HTMLInputElement).type === "email" ||
        (target as HTMLInputElement).type === "number"
      ) {
        // Allow Escape to work in inputs
        if (event.key === "Escape") {
          // Continue to check shortcuts
        } else {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;
        const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Common keyboard shortcuts for the app
export const commonShortcuts: KeyboardShortcut[] = [
  {
    key: "k",
    meta: true,
    action: () => {
      // Toggle command palette - will be handled by component
      const event = new CustomEvent("toggle-command-palette");
      window.dispatchEvent(event);
    },
    description: "Open command palette",
    category: "Navigation",
  },
  {
    key: "?",
    action: () => {
      // Toggle keyboard shortcuts modal
      const event = new CustomEvent("toggle-keyboard-shortcuts");
      window.dispatchEvent(event);
    },
    description: "Show keyboard shortcuts",
    category: "Help",
  },
  {
    key: "Escape",
    action: () => {
      // Close modals, dropdowns, etc.
      const event = new CustomEvent("close-modals");
      window.dispatchEvent(event);
    },
    description: "Close modals/dropdowns",
    category: "Navigation",
  },
];

