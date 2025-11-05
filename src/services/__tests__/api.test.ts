import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import apiClient, { ApiError } from '../api';

// Mock fetch globally
(globalThis as any).fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('makes GET request successfully', async () => {
    const mockResponse = { data: { id: '1', name: 'Test' } };
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await apiClient.get('/test');
    
    expect(result.data).toEqual(mockResponse.data);
    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('makes POST request with data', async () => {
    const mockResponse = { data: { id: '1' } };
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await apiClient.post('/test', { name: 'Test' });
    
    expect(result.data).toEqual(mockResponse.data);
    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      })
    );
  });

  it('includes auth token in headers when available', async () => {
    localStorage.setItem('authToken', 'test-token');
    const mockResponse = { data: {} };
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    await apiClient.get('/test');
    
    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('handles 401 error and attempts token refresh', async () => {
    const refreshToken = 'refresh-token';
    localStorage.setItem('authToken', 'expired-token');
    localStorage.setItem('refreshToken', refreshToken);

    // First request returns 401
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });

    // Refresh token request succeeds
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { accessToken: 'new-token' } }),
    });

    // Retry request succeeds
    const mockResponse = { data: { id: '1' } };
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await apiClient.get('/test');
    
    expect(result.data).toEqual(mockResponse.data);
    expect(localStorage.getItem('authToken')).toBe('new-token');
  });

  it('throws ApiError for non-ok responses', async () => {
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' }),
    });

    await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
  });

  it('handles network errors gracefully', async () => {
    ((globalThis as any).fetch as any).mockRejectedValueOnce(new TypeError('Network error'));

    await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
  });

  it('makes PUT request', async () => {
    const mockResponse = { data: { id: '1', updated: true } };
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await apiClient.put('/test', { name: 'Updated' });
    
    expect(result.data).toEqual(mockResponse.data);
    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('makes DELETE request', async () => {
    const mockResponse = { data: { success: true } };
    ((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await apiClient.delete('/test');
    
    expect(result.data).toEqual(mockResponse.data);
    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

