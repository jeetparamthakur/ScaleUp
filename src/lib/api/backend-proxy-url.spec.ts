import {
  buildBackendProxyUrl,
  resolveBackendProxyOrigin,
} from './backend-proxy-url';

describe('resolveBackendProxyOrigin', () => {
  it('prefers MARKOS_BACKEND_INTERNAL_URL', () => {
    expect(
      resolveBackendProxyOrigin({
        MARKOS_BACKEND_INTERNAL_URL: 'https://api.example.com/',
        NEXT_PUBLIC_BACKEND_URL: 'https://ignored.example.com',
      }),
    ).toBe('https://api.example.com');
  });

  it('falls back to NEXT_PUBLIC_BACKEND_URL', () => {
    expect(
      resolveBackendProxyOrigin({
        NEXT_PUBLIC_BACKEND_URL: 'https://api.example.com',
      }),
    ).toBe('https://api.example.com');
  });

  it('uses localhost off Vercel when unset', () => {
    expect(resolveBackendProxyOrigin({})).toBe('http://localhost:3008');
  });

  it('returns null on Vercel when unset', () => {
    expect(resolveBackendProxyOrigin({ VERCEL: '1' })).toBeNull();
  });
});

describe('buildBackendProxyUrl', () => {
  it('strips the /api prefix', () => {
    expect(
      buildBackendProxyUrl('/api/health', '', 'https://api.example.com').href,
    ).toBe('https://api.example.com/health');
  });

  it('forwards the query string', () => {
    expect(
      buildBackendProxyUrl(
        '/api/auth/login',
        '?next=/workspace',
        'https://api.example.com',
      ).href,
    ).toBe('https://api.example.com/auth/login?next=/workspace');
  });
});
