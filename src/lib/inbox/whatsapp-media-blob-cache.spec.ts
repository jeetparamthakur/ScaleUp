import {
  acquireWhatsappMediaBlobCache,
  clearWhatsappMediaBlobCache,
  peekWhatsappMediaBlobCache,
  releaseWhatsappMediaBlobCache,
  storeWhatsappMediaBlobCache,
  whatsappMediaBlobCacheKey,
} from './whatsapp-media-blob-cache';

describe('whatsappMediaBlobCacheKey', () => {
  it('combines conversation and message ids', () => {
    expect(whatsappMediaBlobCacheKey('c1', 'm1')).toBe('c1:m1');
  });
});

describe('whatsapp media blob cache', () => {
  afterEach(() => {
    clearWhatsappMediaBlobCache();
  });

  it('stores and peeks without incrementing refCount', () => {
    const blob = new Blob(['x'], { type: 'image/jpeg' });
    storeWhatsappMediaBlobCache('c1', 'm1', blob, 'image/jpeg');
    expect(peekWhatsappMediaBlobCache('c1', 'm1')?.contentType).toBe(
      'image/jpeg',
    );
    expect(acquireWhatsappMediaBlobCache('c1', 'm1')).toBeTruthy();
    releaseWhatsappMediaBlobCache('c1', 'm1');
  });

  it('acquire increments refCount and release allows eviction', () => {
    const blob = new Blob(['x'], { type: 'image/jpeg' });
    storeWhatsappMediaBlobCache('c1', 'm1', blob, 'image/jpeg');
    const first = acquireWhatsappMediaBlobCache('c1', 'm1');
    expect(first?.objectUrl).toBeTruthy();
    releaseWhatsappMediaBlobCache('c1', 'm1');
    expect(peekWhatsappMediaBlobCache('c1', 'm1')).toBeTruthy();
  });
});
