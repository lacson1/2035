import { vi } from 'vitest';
import { MockApiFactory, PatientFactory, UserFactory } from '../factories/testDataFactory';

// HTTP request mocking utilities
export class MockHttpClient {
  private static mocks: Map<string, any> = new Map();

  static mockGet(url: string, response: any) {
    this.mocks.set(`GET:${url}`, response);
  }

  static mockPost(url: string, response: any) {
    this.mocks.set(`POST:${url}`, response);
  }

  static mockPut(url: string, response: any) {
    this.mocks.set(`PUT:${url}`, response);
  }

  static mockDelete(url: string, response: any) {
    this.mocks.set(`DELETE:${url}`, response);
  }

  static getMockResponse(method: string, url: string) {
    return this.mocks.get(`${method.toUpperCase()}:${url}`);
  }

  static clearMocks() {
    this.mocks.clear();
  }

  static mockApiError(url: string, error: any, method = 'GET') {
    this.mocks.set(`${method.toUpperCase()}:${url}`, Promise.reject(error));
  }

  static mockNetworkError(url: string, method = 'GET') {
    this.mocks.set(`${method.toUpperCase()}:${url}`, Promise.reject(new Error('Network Error')));
  }

  static mockTimeout(url: string, delay = 5000, method = 'GET') {
    this.mocks.set(`${method.toUpperCase()}:${url}`,
      new Promise(resolve => setTimeout(resolve, delay))
    );
  }
}

// React context mocking utilities
export class MockContextFactory {
  static createAuthContext() {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    const mockRegister = vi.fn().mockResolvedValue(undefined);
    const mockLogout = vi.fn().mockResolvedValue(undefined);

    return {
      user: UserFactory.createDoctor(),
      isAuthenticated: true,
      isLoading: false,
      login: mockLogin,
      register: mockRegister,
      logout: mockLogout,
    };
  }

  static createDashboardContext() {
    const mockPatients = PatientFactory.createMany(5);
    const mockSetSelectedPatient = vi.fn();
    const mockSetActiveTab = vi.fn();

    return {
      patients: mockPatients,
      selectedPatient: mockPatients[0],
      activeTab: 'overview',
      setSelectedPatient: mockSetSelectedPatient,
      setActiveTab: mockSetActiveTab,
      isLoading: false,
      error: null,
    };
  }

  static createToastContext() {
    const mockSuccess = vi.fn();
    const mockError = vi.fn();
    const mockWarning = vi.fn();
    const mockInfo = vi.fn();

    return {
      success: mockSuccess,
      error: mockError,
      warning: mockWarning,
      info: mockInfo,
      toasts: [],
    };
  }

  static createNotificationContext() {
    const mockAddNotification = vi.fn();
    const mockRemoveNotification = vi.fn();
    const mockClearNotifications = vi.fn();

    return {
      notifications: [],
      addNotification: mockAddNotification,
      removeNotification: mockRemoveNotification,
      clearNotifications: mockClearNotifications,
      unreadCount: 0,
    };
  }
}

// Local storage mocking utilities
export class MockLocalStorage {
  private static storage: Map<string, string> = new Map();

  static mock() {
    const mockGetItem = vi.fn((key: string) => this.storage.get(key) || null);
    const mockSetItem = vi.fn((key: string, value: string) => {
      this.storage.set(key, value);
    });
    const mockRemoveItem = vi.fn((key: string) => {
      this.storage.delete(key);
    });
    const mockClear = vi.fn(() => {
      this.storage.clear();
    });

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
        removeItem: mockRemoveItem,
        clear: mockClear,
        length: 0,
        key: vi.fn(),
      },
      writable: true,
    });

    return {
      getItem: mockGetItem,
      setItem: mockSetItem,
      removeItem: mockRemoveItem,
      clear: mockClear,
      getStorage: () => this.storage,
    };
  }

  static setItem(key: string, value: string) {
    this.storage.set(key, value);
  }

  static getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  static clear() {
    this.storage.clear();
  }
}

// Timer mocking utilities
export class MockTimer {
  static mock() {
    const mockSetTimeout = vi.fn((callback, delay) => {
      const timerId = Math.random();
      // Immediately execute for testing purposes
      if (delay === 0 || delay === undefined) {
        callback();
      } else {
        setTimeout(callback, 0); // Execute in next tick
      }
      return timerId;
    });

    const mockClearTimeout = vi.fn();
    const mockSetInterval = vi.fn();
    const mockClearInterval = vi.fn();

    vi.stubGlobal('setTimeout', mockSetTimeout);
    vi.stubGlobal('clearTimeout', mockClearTimeout);
    vi.stubGlobal('setInterval', mockSetInterval);
    vi.stubGlobal('clearInterval', mockClearInterval);

    return {
      setTimeout: mockSetTimeout,
      clearTimeout: mockClearTimeout,
      setInterval: mockSetInterval,
      clearInterval: mockClearInterval,
    };
  }
}

// Intersection Observer mocking utilities
export class MockIntersectionObserver {
  static mock() {
    const mockObserve = vi.fn();
    const mockUnobserve = vi.fn();
    const mockDisconnect = vi.fn();

    const MockObserver = vi.fn().mockImplementation(() => ({
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    }));

    (globalThis as any).IntersectionObserver = MockObserver;

    return {
      IntersectionObserver: MockObserver,
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    };
  }
}

// Resize Observer mocking utilities
export class MockResizeObserver {
  static mock() {
    const mockObserve = vi.fn();
    const mockUnobserve = vi.fn();
    const mockDisconnect = vi.fn();

    const MockObserver = vi.fn().mockImplementation(() => ({
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    }));

    (globalThis as any).ResizeObserver = MockObserver;

    return {
      ResizeObserver: MockObserver,
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    };
  }
}

// Geolocation mocking utilities
export class MockGeolocation {
  static mock() {
    const mockGetCurrentPosition = vi.fn((success, error) => {
      const position = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 100,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };
      success(position);
    });

    const mockWatchPosition = vi.fn();
    const mockClearWatch = vi.fn();

    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: mockGetCurrentPosition,
        watchPosition: mockWatchPosition,
        clearWatch: mockClearWatch,
      },
      writable: true,
    });

    return {
      getCurrentPosition: mockGetCurrentPosition,
      watchPosition: mockWatchPosition,
      clearWatch: mockClearWatch,
    };
  }
}

// WebSocket mocking utilities
export class MockWebSocket {
  static mock() {
    const mockSend = vi.fn();
    const mockClose = vi.fn();
    const mockAddEventListener = vi.fn();
    const mockRemoveEventListener = vi.fn();

    const MockWS = vi.fn().mockImplementation(() => ({
      send: mockSend,
      close: mockClose,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      readyState: 1, // OPEN
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
    }));

    (globalThis as any).WebSocket = MockWS;

    return {
      WebSocket: MockWS,
      send: mockSend,
      close: mockClose,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    };
  }
}

// Media query mocking utilities
export class MockMediaQuery {
  static mock() {
    const mockMatches = vi.fn().mockReturnValue(false);
    const mockAddListener = vi.fn();
    const mockRemoveListener = vi.fn();

    const mockMatchMedia = vi.fn().mockImplementation(() => ({
      matches: mockMatches(),
      media: '',
      onchange: null,
      addListener: mockAddListener,
      removeListener: mockRemoveListener,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia,
      writable: true,
    });

    return {
      matchMedia: mockMatchMedia,
      matches: mockMatches,
      addListener: mockAddListener,
      removeListener: mockRemoveListener,
    };
  }

  static setMatches(matches: boolean) {
    const mediaQuery = window.matchMedia('');
    (mediaQuery as any).matches = matches;
  }
}

// Clipboard mocking utilities
export class MockClipboard {
  static mock() {
    const mockReadText = vi.fn().mockResolvedValue('');
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        readText: mockReadText,
        writeText: mockWriteText,
      },
      writable: true,
    });

    return {
      readText: mockReadText,
      writeText: mockWriteText,
    };
  }
}

// File API mocking utilities
export class MockFileAPI {
  static createMockFile(name = 'test.txt', size = 1024, type = 'text/plain'): File {
    const blob = new Blob(['test content'], { type });
    Object.defineProperty(blob, 'name', { value: name });
    Object.defineProperty(blob, 'size', { value: size });
    return blob as File;
  }

  static mockFileReader() {
    const mockReadAsText = vi.fn();
    const mockReadAsDataURL = vi.fn();
    const mockReadAsArrayBuffer = vi.fn();

    const MockFileReader = vi.fn().mockImplementation(() => ({
      readAsText: mockReadAsText,
      readAsDataURL: mockReadAsDataURL,
      readAsArrayBuffer: mockReadAsArrayBuffer,
      result: null,
      onload: null,
      onerror: null,
      readyState: 0,
      EMPTY: 0,
      LOADING: 1,
      DONE: 2,
    }));

    (globalThis as any).FileReader = MockFileReader;

    return {
      FileReader: MockFileReader,
      readAsText: mockReadAsText,
      readAsDataURL: mockReadAsDataURL,
      readAsArrayBuffer: mockReadAsArrayBuffer,
    };
  }
}

// Notification API mocking utilities
export class MockNotificationAPI {
  static mock() {
    const mockRequestPermission = vi.fn().mockResolvedValue('granted');
    const mockPermission = 'granted';

    Object.defineProperty(window, 'Notification', {
      value: {
        requestPermission: mockRequestPermission,
        permission: mockPermission,
      },
      writable: true,
    });

    return {
      requestPermission: mockRequestPermission,
      permission: mockPermission,
    };
  }
}

// Service Worker mocking utilities
export class MockServiceWorker {
  static mock() {
    const mockRegister = vi.fn().mockResolvedValue({
      active: null,
      installing: null,
      waiting: null,
      update: vi.fn(),
      unregister: vi.fn(),
    });

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: mockRegister,
        ready: Promise.resolve({}),
        controller: null,
        getRegistrations: vi.fn().mockResolvedValue([]),
        getRegistration: vi.fn().mockResolvedValue(null),
      },
      writable: true,
    });

    return {
      register: mockRegister,
    };
  }
}

// Complete test environment setup utility
export class TestEnvironment {
  static setup() {
    const mocks = {
      localStorage: MockLocalStorage.mock(),
      timer: MockTimer.mock(),
      intersectionObserver: MockIntersectionObserver.mock(),
      resizeObserver: MockResizeObserver.mock(),
      mediaQuery: MockMediaQuery.mock(),
      clipboard: MockClipboard.mock(),
      fileReader: MockFileAPI.mockFileReader(),
      notification: MockNotificationAPI.mock(),
      serviceWorker: MockServiceWorker.mock(),
      webSocket: MockWebSocket.mock(),
      geolocation: MockGeolocation.mock(),
    };

    return mocks;
  }

  static teardown() {
    vi.restoreAllMocks();
    MockHttpClient.clearMocks();
    MockLocalStorage.clear();
  }
}

// Common test scenarios
export class TestScenarios {
  static async simulateNetworkDelay(delay = 1000) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  static async simulateApiCall<T>(data: T, delay = 100): Promise<T> {
    await this.simulateNetworkDelay(delay);
    return data;
  }

  static async simulateApiError(message: string, delay = 100): Promise<never> {
    await this.simulateNetworkDelay(delay);
    throw new Error(message);
  }

  static createMockEvent(type: string, properties: any = {}) {
    return {
      type,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: { value: '', ...properties.target },
      currentTarget: { ...properties.currentTarget },
      ...properties,
    };
  }

  static createMockKeyboardEvent(key: string, options: Partial<KeyboardEventInit> = {}) {
    return new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    });
  }

  static createMockMouseEvent(type: string, options: Partial<MouseEventInit> = {}) {
    return new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      ...options,
    });
  }
}
