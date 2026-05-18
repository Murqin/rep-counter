// src/lib/wakeLock.ts

/**
 * Interface for the Screen Wake Lock API's sentinel object.
 */
export interface WakeLockSentinel extends EventTarget {
  readonly released: boolean;
  readonly type: 'screen';
  release(): Promise<void>;
  onrelease: ((this: WakeLockSentinel, ev: Event) => any) | null;
}

/**
 * Interface for the Screen Wake Lock API.
 */
interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>;
}

/**
 * Extension for the Navigator interface to include the wakeLock property.
 */
interface NavigatorWithWakeLock extends Navigator {
  readonly wakeLock: WakeLock;
}

/**
 * Requests a screen wake lock.
 * @returns A promise that resolves to a WakeLockSentinel or null if not supported/failed.
 */
export async function requestWakeLock(): Promise<WakeLockSentinel | null> {
  if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
    try {
      const wakeLock = await (navigator as unknown as NavigatorWithWakeLock).wakeLock.request('screen');
      return wakeLock;
    } catch (err: any) {
      // Failed to request wake lock
    }
  }
  return null;
}
