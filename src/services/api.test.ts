import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  requestUse: vi.fn(),
  responseUse: vi.fn(),
  isUserAuthenticated: vi.fn(),
  getToken: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mocks.get,
      post: mocks.post,
      interceptors: {
        request: { use: mocks.requestUse },
        response: { use: mocks.responseUse },
      },
    })),
  },
}));

vi.mock('../utils/GlobalVariables', () => ({
  apiRoutes: {
    list_publications_url: '/publications/list-publications',
    list_publications_user_auth_url: '/publications/list-publications-user-auth',
    edit_publication_url: '/publications/edit',
  },
  getToken: mocks.getToken,
  isUserAuthenticated: mocks.isUserAuthenticated,
}));

import { api } from './api';

describe('Frontend API Service', () => {
  beforeEach(() => {
    mocks.get.mockReset();
    mocks.post.mockReset();
    mocks.getToken.mockReset();
    mocks.isUserAuthenticated.mockReset();
    mocks.getToken.mockResolvedValue(null);
    mocks.isUserAuthenticated.mockResolvedValue(false);
  });

  it('should map publications to camelCase correctly', async () => {
    const rawData = {
      items: [{ Id_publicacion: '123', Correo_electronico: 'author@example.com', Contenido: 'Hola' }],
      nextToken: 'abc'
    };

    mocks.get.mockResolvedValue({ data: rawData });

    const response = await api.publications.list(10);
    
    expect(response.items[0].id).toBe('123');
    expect(response.items[0].content).toBe('Hola');
    expect(response.items[0].user?.username).toBe('Usuario');
    expect(response.items[0].user?.username).not.toBe('author');
    expect(response.hasMore).toBe(true);
    expect(mocks.get).toHaveBeenCalledWith('/publications/list-publications', {
      params: { limit: 10, nextToken: undefined },
    });
  });

  it('should preserve HTTP status and response data in API errors', async () => {
    const errorHandler = mocks.responseUse.mock.calls[0][1] as (error: unknown) => Promise<never>;
    const responseData = { message: 'No tienes permiso' };

    await expect(errorHandler({
      message: 'Request failed',
      response: {
        status: 403,
        data: responseData,
      },
    })).rejects.toMatchObject({
      name: 'ApiError',
      status: 403,
      message: '403: No tienes permiso',
      data: responseData,
    });
  });

  it('continues a public request when token lookup fails', async () => {
    const requestHandler = mocks.requestUse.mock.calls[0][0] as (config: { headers: Record<string, string> }) => Promise<{ headers: Record<string, string> }>;
    const config: { headers: Record<string, string> } = { headers: {} };
    mocks.getToken.mockRejectedValue(new Error('No active session'));

    await expect(requestHandler(config)).resolves.toBe(config);
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('edits publications with the current API contract and preserves zero coordinates', async () => {
    mocks.post.mockResolvedValue({
      data: {
        publication: {
          id: '123',
          content: 'Actualizado',
          lat: 0,
          long: 0,
        },
      },
    });

    const publication = await api.publications.edit('123', {
      content: 'Actualizado',
      imageUrl: null,
      videoUrl: null,
      lat: 0,
      long: 0,
    });

    expect(mocks.post).toHaveBeenCalledWith('/publications/edit', {
      id: '123',
      content: 'Actualizado',
      imageUrl: null,
      videoUrl: null,
      lat: 0,
      long: 0,
    });
    expect(publication.lat).toBe(0);
    expect(publication.long).toBe(0);
  });
});
