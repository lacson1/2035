import { useEffect, useCallback } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useToast } from '../context/ToastContext';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  category: string;
}

export const useKeyboardShortcuts = () => {
  const { patients, selectedPatient, setSelectedPatient, setActiveTab } = useDashboard();
  const toast = useToast();

  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: 'ArrowLeft',
      ctrl: true,
      action: () => {
        if (!patients.length || !selectedPatient) return;
        const currentIndex = patients.findIndex(p => p.id === selectedPatient.id);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : patients.length - 1;
        setSelectedPatient(patients[prevIndex]);
        toast.success(`Selected patient: ${patients[prevIndex].name}`);
      },
      description: 'Previous patient',
      category: 'Navigation'
    },
    {
      key: 'ArrowRight',
      ctrl: true,
      action: () => {
        if (!patients.length || !selectedPatient) return;
        const currentIndex = patients.findIndex(p => p.id === selectedPatient.id);
        const nextIndex = currentIndex < patients.length - 1 ? currentIndex + 1 : 0;
        setSelectedPatient(patients[nextIndex]);
        toast.success(`Selected patient: ${patients[nextIndex].name}`);
      },
      description: 'Next patient',
      category: 'Navigation'
    },

    // Quick Actions
    {
      key: 'n',
      ctrl: true,
      action: () => {
        // Navigate to consultation tab for new note
        setActiveTab('consultation');
        toast.success('Switched to consultation for new note');
      },
      description: 'New consultation note',
      category: 'Actions'
    },
    {
      key: 'm',
      ctrl: true,
      shift: true,
      action: () => {
        // Navigate to medications
        setActiveTab('medications');
        toast.success('Switched to medications');
      },
      description: 'View medications',
      category: 'Actions'
    },
    {
      key: 'l',
      ctrl: true,
      action: () => {
        // Navigate to lab results
        setActiveTab('labs');
        toast.success('Switched to lab results');
      },
      description: 'View lab results',
      category: 'Actions'
    },

    // Tab Navigation
    {
      key: '1',
      ctrl: true,
      action: () => {
        setActiveTab('overview');
        toast.success('Switched to overview');
      },
      description: 'Overview tab',
      category: 'Tabs'
    },
    {
      key: '2',
      ctrl: true,
      action: () => {
        setActiveTab('consultation');
        toast.success('Switched to consultation');
      },
      description: 'Consultation tab',
      category: 'Tabs'
    },
    {
      key: '3',
      ctrl: true,
      action: () => {
        setActiveTab('medications');
        toast.success('Switched to medications');
      },
      description: 'Medications tab',
      category: 'Tabs'
    },
    {
      key: '4',
      ctrl: true,
      action: () => {
        setActiveTab('labs');
        toast.success('Switched to labs');
      },
      description: 'Labs tab',
      category: 'Tabs'
    },
    {
      key: '5',
      ctrl: true,
      action: () => {
        setActiveTab('timeline');
        toast.success('Switched to timeline');
      },
      description: 'Timeline tab',
      category: 'Tabs'
    },

    // Search and UI
    {
      key: 'k',
      ctrl: true,
      action: () => {
        // Focus search input (would need ref to search input)
        const searchInput = document.querySelector('input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
          toast.success('Search focused');
        }
      },
      description: 'Focus search',
      category: 'UI'
    },
    {
      key: 'r',
      ctrl: true,
      action: () => {
        // Refresh data
        window.location.reload();
      },
      description: 'Refresh page',
      category: 'UI'
    },
    {
      key: '/',
      shift: true,
      action: () => {
        // Show keyboard shortcuts help
        showKeyboardShortcutsHelp();
      },
      description: 'Show keyboard shortcuts',
      category: 'Help'
    },
  ];

  const showKeyboardShortcutsHelp = useCallback(() => {
    const categories = shortcuts.reduce((acc, shortcut) => {
      if (!acc[shortcut.category]) acc[shortcut.category] = [];
      acc[shortcut.category].push(shortcut);
      return acc;
    }, {} as Record<string, KeyboardShortcut[]>);

    const helpContent = Object.entries(categories)
      .map(([category, shortcuts]) => {
        const shortcutsList = shortcuts
          .map(s => {
            const keys = [];
            if (s.ctrl) keys.push('Ctrl');
            if (s.shift) keys.push('Shift');
            if (s.alt) keys.push('Alt');
            keys.push(s.key.toUpperCase());
            return `  ${keys.join('+')} - ${s.description}`;
          })
          .join('\n');

        return `${category}:\n${shortcutsList}`;
      })
      .join('\n\n');

    // Create modal or use toast for help
    toast.info(
      `Keyboard Shortcuts:\n\n${helpContent}`,
      { duration: 10000 }
    );
  }, [shortcuts, toast]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatches = !!shortcut.ctrl === event.ctrlKey;
        const shiftMatches = !!shortcut.shift === event.shiftKey;
        const altMatches = !!shortcut.alt === event.altKey;

        return keyMatches && ctrlMatches && shiftMatches && altMatches;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);

  // Return shortcuts for help display
  return {
    shortcuts,
    showHelp: showKeyboardShortcutsHelp,
  };
};