import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPresignedUrl: vi.fn(),
}));

vi.mock('../services/api', () => ({
  api: {
    media: {
      getPresignedUrl: mocks.getPresignedUrl,
    },
  },
}));

import { sanitizeFileName, uploadFile } from './UploadUtils';

describe('uploadFile', () => {
  beforeEach(() => {
    mocks.getPresignedUrl.mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sanitizes names and returns the media URL after a successful upload', async () => {
    mocks.getPresignedUrl.mockResolvedValue({
      uploadUrl: 'https://uploads.example.com/signed',
      fileUrl: 'https://cdn.example.com/photo.jpg',
    });
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({ ok: true, status: 200 } as Response);
    const file = { name: 'Foto de perfil.jpg', type: 'image/jpeg' } as File;

    await expect(uploadFile(file, 'profile')).resolves.toBe('https://cdn.example.com/photo.jpg');
    expect(sanitizeFileName(file.name)).toBe('foto_de_perfil.jpg');
    expect(mocks.getPresignedUrl).toHaveBeenCalledWith('foto_de_perfil.jpg', 'image/jpeg', 'profile');
    expect(fetchMock).toHaveBeenCalledWith('https://uploads.example.com/signed', expect.objectContaining({
      method: 'PUT',
      body: file,
    }));
  });

  it('rejects a failed storage response instead of returning a broken URL', async () => {
    mocks.getPresignedUrl.mockResolvedValue({
      uploadUrl: 'https://uploads.example.com/signed',
      fileUrl: 'https://cdn.example.com/photo.jpg',
    });
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({ ok: false, status: 403 } as Response);
    const file = { name: 'photo.jpg', type: 'image/jpeg' } as File;

    await expect(uploadFile(file, 'publications')).rejects.toThrow('No se pudo subir el archivo (403)');
  });
});
