import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestWakeLock } from './wakeLock';

describe('wakeLock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    delete global.navigator.wakeLock;
  });

  it('should return null if wakeLock is not in navigator', async () => {
    const result = await requestWakeLock();
    expect(result).toBeNull();
  });

  it('should return null if request fails', async () => {
    const mockRequest = vi.fn().mockRejectedValue(new Error('Failed'));
    // @ts-ignore
    global.navigator.wakeLock = { request: mockRequest };

    const result = await requestWakeLock();
    expect(result).toBeNull();
    expect(mockRequest).toHaveBeenCalledWith('screen');
  });

  it('should return sentinel if request succeeds', async () => {
    const mockSentinel = { release: vi.fn() };
    const mockRequest = vi.fn().mockResolvedValue(mockSentinel);
    // @ts-ignore
    global.navigator.wakeLock = { request: mockRequest };

    const result = await requestWakeLock();
    expect(result).toBe(mockSentinel);
    expect(mockRequest).toHaveBeenCalledWith('screen');
  });
});
