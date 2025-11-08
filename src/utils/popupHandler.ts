/**
 * Utility functions for handling pop-ups with proper error handling
 * for cases where pop-ups are blocked by the browser
 */

import { logger } from './logger';

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
  // Try iframe method first (works even with pop-up blockers)
  try {
    // Check if we should use iframe (more reliable)
    const useIframe = true; // Always prefer iframe for better reliability
    
    if (useIframe) {
      printUsingIframe(content, title);
      return true;
    }
  } catch (iframeError) {
    logger.warn('Iframe print failed, trying window.open:', iframeError);
  }
  
  // Fallback to window.open method
  const result = openPopup('', '_blank', 'width=800,height=600,scrollbars=yes');
  
  if (!result.success || !result.window) {
    // If window.open fails, try iframe as fallback
    try {
      printUsingIframe(content, title);
      return true;
    } catch {
      showPopupBlockedMessage(() => openPrintWindow(content, title));
      return false;
    }
  }

  try {
    const printWindow = result.window;
    
    // Write content to the window
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.document.title = title;
    
    // Focus the window
    printWindow.focus();
    
    // Wait for the window to fully load before printing
    // Use both onload and a fallback timeout
    const triggerPrint = () => {
      try {
        // Small delay to ensure rendering is complete
        setTimeout(() => {
          try {
            printWindow.print();
          } catch (printError) {
            logger.error('Error triggering print:', printError);
            // Show user-friendly message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'fixed top-4 right-4 z-50 max-w-md bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg shadow-lg p-4';
            errorMsg.innerHTML = `
              <div class="flex items-start gap-3">
                <svg class="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div class="flex-1">
                  <h4 class="font-semibold text-rose-900 dark:text-rose-100 mb-1">Print Error</h4>
                  <p class="text-sm text-rose-800 dark:text-rose-200 mb-2">
                    Unable to trigger print dialog automatically. The print window is open - please use Ctrl+P (Cmd+P on Mac) to print.
                  </p>
                  <button onclick="this.parentElement.parentElement.parentElement.remove()" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-medium">Dismiss</button>
                </div>
              </div>
            `;
            document.body.appendChild(errorMsg);
            setTimeout(() => errorMsg.remove(), 8000);
          }
        }, 100);
      } catch (error) {
        logger.error('Error in print trigger:', error);
      }
    };

    // Check if window is loaded
    if (printWindow.document.readyState === 'complete') {
      triggerPrint();
    } else {
      // Wait for load event
      printWindow.addEventListener('load', triggerPrint, { once: true });
      
      // Fallback timeout in case load event doesn't fire
      setTimeout(triggerPrint, 500);
    }

    return true;
  } catch (error) {
    logger.error('Error opening print window:', error);
    showPopupBlockedMessage(() => openPrintWindow(content, title));
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

/**
 * Alternative print method using iframe (works even when pop-ups are blocked)
 * @param content - HTML content to print
 * @param title - Document title
 */
export function printUsingIframe(content: string, title: string = 'Print'): void {
  try {
    logger.debug('[printUsingIframe] Starting print with title:', title);
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.visibility = 'hidden';
    iframe.title = title;
    iframe.src = 'about:blank'; // Set blank src to ensure iframe loads
    
    let hasPrinted = false; // Flag to prevent multiple print attempts
    
    // Function to write content and trigger print
    const writeContentAndPrint = () => {
      if (hasPrinted) return; // Prevent duplicate calls
      hasPrinted = true;
      logger.debug('[printUsingIframe] Writing content to iframe');
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          throw new Error('Cannot access iframe document');
        }
        
        logger.debug('[printUsingIframe] Iframe document accessible, writing content');
        iframeDoc.open();
        iframeDoc.write(content);
        iframeDoc.close();
        logger.debug('[printUsingIframe] Content written successfully');
        
        // Trigger print after content is written
        const triggerPrint = () => {
          logger.debug('[printUsingIframe] Triggering print');
          try {
            if (iframe.contentWindow) {
              iframe.contentWindow.focus();
              logger.debug('[printUsingIframe] Calling print()');
              iframe.contentWindow.print();
              logger.debug('[printUsingIframe] Print() called successfully');
              
              // Clean up after printing (give user time to interact with print dialog)
              setTimeout(() => {
                if (iframe.parentNode) {
                  document.body.removeChild(iframe);
                }
              }, 2000);
            }
          } catch (printError) {
            logger.error('[printUsingIframe] Error triggering print:', printError);
            if (iframe.parentNode) {
              document.body.removeChild(iframe);
            }
            // Fallback: show content in a new window using blob URL
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const newWindow = window.open(url, '_blank');
            if (newWindow) {
              setTimeout(() => {
                newWindow.print();
                setTimeout(() => URL.revokeObjectURL(url), 2000);
              }, 500);
            } else {
              URL.revokeObjectURL(url);
              showPopupBlockedMessage();
            }
          }
        };
        
        // Wait a moment for content to render, then trigger print
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          setTimeout(triggerPrint, 300);
        });
      } catch (writeError) {
        logger.error('Error writing to iframe:', writeError);
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
        throw writeError;
      }
    };
    
    document.body.appendChild(iframe);
    
    // Wait for iframe to load, then write content
    iframe.onload = () => {
      writeContentAndPrint();
    };
    
    // Fallback: try after a delay if onload doesn't fire
    setTimeout(() => {
      if (iframe.parentNode) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc && iframeDoc.readyState === 'complete') {
          writeContentAndPrint();
        }
      }
    }, 200);
  } catch (error) {
    logger.error('Error creating print iframe:', error);
    // Final fallback: try window.open directly
    const result = openPopup('', '_blank', 'width=800,height=600,scrollbars=yes');
    if (result.success && result.window) {
      try {
        result.window.document.open();
        result.window.document.write(content);
        result.window.document.close();
        result.window.focus();
        setTimeout(() => {
          try {
            result.window?.print();
          } catch {
            showPopupBlockedMessage();
          }
        }, 500);
      } catch {
        showPopupBlockedMessage();
      }
    } else {
      showPopupBlockedMessage();
    }
  }
}

