const LOCAL_BACKEND_ORIGIN = 'http://localhost:3008';

type EnvLookup = Record<string, string | undefined>;

function trimOrigin(value: string | undefined): string {
  return value?.trim().replace(/\/$/, '') ?? '';
}

/**
 * Backend origin for `/api/*` proxying. Read at request time so Vercel env
 * changes apply without a rebuild.
 */
export function resolveBackendProxyOrigin(
  env: EnvLookup = process.env,
): string | null {
  const configured =
    trimOrigin(env.MARKOS_BACKEND_INTERNAL_URL) ||
    trimOrigin(env.NEXT_PUBLIC_BACKEND_URL);

  if (configured) {
    return configured;
  }

  if (env.VERCEL === '1') {
    return null;
  }

  return LOCAL_BACKEND_ORIGIN;
}

export function buildBackendProxyUrl(
  pathname: string,
  search: string,
  origin: string,
): URL {
  const backendPath = pathname.replace(/^\/api(?=\/|$)/, '') || '/';
  const base = origin.endsWith('/') ? origin : `${origin}/`;
  return new URL(backendPath + search, base);
}
