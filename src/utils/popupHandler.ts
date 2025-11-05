/**
 * Utility functions for handling pop-ups with proper error handling
 * for cases where pop-ups are blocked by the browser
 */

export interface PopupResult {
  success: boolean;
  window: Window | null;
  error?: string;
}

/**
 * Opens a popup window with error handling for blocked pop-ups
 * @param url - URL to open (empty string for new window)
 * @param name - Window name/target
 * @param features - Window features
 * @returns PopupResult with success status and window reference
 */
export function openPopup(
  url: string = '',
  name: string = '_blank',
  features: string = 'width=800,height=600,scrollbars=yes,resizable=yes'
): PopupResult {
  try {
    const popup = window.open(url, name, features);
    
    // Check if popup was blocked
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      return {
        success: false,
        window: null,
        error: 'popup_blocked'
      };
    }

    return {
      success: true,
      window: popup
    };
  } catch (error) {
    return {
      success: false,
      window: null,
      error: 'popup_error'
    };
  }
}

/**
 * Shows a user-friendly message when pop-ups are blocked
 * @param onRetry - Optional callback to retry the action
 * @returns A callback function to dismiss the notification
 */
export function showPopupBlockedMessage(onRetry?: () => void): (() => void) | null {
  // Create a notification element
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 z-50 max-w-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-lg p-4';
  notification.innerHTML = `
    <div class="flex items-start gap-3">
      <svg class="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Pop-ups Blocked</h4>
        <p class="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
          To enable printing and other features, please allow pop-ups for this site.
        </p>
        <div class="space-y-1 text-xs text-yellow-700 dark:text-yellow-300 mb-3">
          <div>1. Click the pop-up blocker icon in your browser's address bar</div>
          <div>2. Select "Always allow pop-ups from this site"</div>
          <div>3. Or go to your browser settings and add this site to the allowed list</div>
        </div>
        <div class="flex items-center gap-2">
          ${onRetry ? `<button class="popup-retry-btn px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-xs font-medium">Try Again</button>` : ''}
          <button class="popup-dismiss-btn px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/40 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 text-yellow-900 dark:text-yellow-100 rounded-md text-xs font-medium">Dismiss</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Add event listeners
  const retryBtn = notification.querySelector('.popup-retry-btn');
  const dismissBtn = notification.querySelector('.popup-dismiss-btn');

  const dismiss = () => {
    notification.remove();
  };

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      dismiss();
      if (onRetry) onRetry();
    });
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('click', dismiss);
  }

  // Auto-dismiss after 10 seconds
  setTimeout(dismiss, 10000);

  return dismiss;
}

/**
 * Attempts to open a print window with error handling
 * @param content - HTML content to print
 * @param title - Document title
 * @returns boolean indicating success
 */
export function openPrintWindow(content: string, title: string = 'Print'): boolean {
  const result = openPopup('', '_blank', 'width=800,height=600');
  
  if (!result.success || !result.window) {
    showPopupBlockedMessage(() => openPrintWindow(content, title));
    return false;
  }

  try {
    const printWindow = result.window;
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.document.title = title;
    
    // Focus the window
    printWindow.focus();
    
    // Trigger print dialog after a short delay to ensure content is loaded
    setTimeout(() => {
      try {
        printWindow.print();
      } catch (error) {
        console.error('Error triggering print:', error);
        alert('An error occurred while printing. Please try again or use your browser\'s print function (Ctrl+P / Cmd+P).');
      }
    }, 250);

    return true;
  } catch (error) {
    console.error('Error opening print window:', error);
    alert('An error occurred while opening the print window. Please check your browser\'s pop-up settings.');
    return false;
  }
}

/**
 * Checks if pop-ups are likely to be blocked
 * This is a heuristic check - browsers don't provide a direct API
 */
export function checkPopupSupport(): boolean {
  try {
    // Try to open a test popup
    const testPopup = window.open('', '_blank', 'width=1,height=1');
    if (testPopup) {
      testPopup.close();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

