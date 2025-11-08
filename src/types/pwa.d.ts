// PWA Type Definitions
declare global {
  interface Window {
    __WB_MANIFEST: any[];
  }
}

declare module 'workbox-background-sync' {
  export class BackgroundSyncPlugin {
    constructor(queueName: string, options?: {
      maxRetentionTime?: number;
      onSync?: ({ queue }: { queue: any }) => Promise<void>;
    });
  }
}

declare module 'workbox-expiration' {
  export class ExpirationPlugin {
    constructor(options: {
      maxEntries?: number;
      maxAgeSeconds?: number;
      purgeOnQuotaError?: boolean;
    });
  }
}

declare module 'workbox-cacheable-response' {
  export class CacheableResponsePlugin {
    constructor(options: {
      statuses?: number[];
      headers?: Record<string, string>;
    });
  }
}

// Service Worker types
interface PushEvent extends ExtendableEvent {
  data: PushMessageData | null;
}

interface PushMessageData {
  json(): any;
  text(): string;
  arrayBuffer(): ArrayBuffer;
  blob(): Blob;
}

interface NotificationEvent extends ExtendableEvent {
  action: string;
  notification: Notification;
}

interface SyncEvent extends ExtendableEvent {
  lastChance: boolean;
  tag: string;
}

interface FetchEvent extends ExtendableEvent {
  request: Request;
  preloadResponse?: Promise<Response>;
  respondWith(response: Response | Promise<Response>): void;
  waitUntil(promise: Promise<any>): void;
}

interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

// Notification types
interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
  data?: any;
}

// Service Worker global
declare const self: ServiceWorkerGlobalScope;

interface ServiceWorkerGlobalScope {
  clients: Clients;
  registration: ServiceWorkerRegistration;
  skipWaiting(): Promise<void>;
  addEventListener(type: string, listener: EventListener): void;
}

interface Clients {
  matchAll(options?: { includeUncontrolled?: boolean; type?: 'window' }): Promise<Client[]>;
  openWindow(url: string): Promise<Client | null>;
}

interface Client {
  url: string;
  focus(): Promise<Client>;
  postMessage(message: any): void;
}

// Push Manager types
interface PushManager {
  getSubscription(): Promise<PushSubscription | null>;
  subscribe(options?: PushSubscriptionOptions): Promise<PushSubscription>;
  permissionState(options?: PushSubscriptionOptions): Promise<'granted' | 'denied' | 'prompt'>;
}

interface PushSubscriptionOptions {
  userVisibleOnly?: boolean;
  applicationServerKey?: string | Uint8Array;
}

interface PushSubscription {
  endpoint: string;
  getKey(name: 'p256dh' | 'auth'): ArrayBuffer | null;
  unsubscribe(): Promise<boolean>;
}

// Network Information API
interface NetworkInformation extends EventTarget {
  readonly effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  readonly downlink: number;
  readonly rtt: number;
  readonly saveData: boolean;
  readonly type?: 'bluetooth' | 'cellular' | 'ethernet' | 'wifi' | 'wimax' | 'none' | 'other';
  onchange: ((this: NetworkInformation, ev: Event) => any) | null;
}

interface Navigator {
  connection?: NetworkInformation;
}

export {};
