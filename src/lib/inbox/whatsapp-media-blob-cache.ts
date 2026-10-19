export interface WhatsappMediaBlobCacheEntry {
  blob: Blob;
  contentType: string;
  objectUrl: string;
  refCount: number;
  byteSize: number;
  lastAccessAt: number;
}

const MAX_ENTRIES = 80;
const MAX_TOTAL_BYTES = 150 * 1024 * 1024;

const entries = new Map<string, WhatsappMediaBlobCacheEntry>();
const inflight = new Map<string, Promise<WhatsappMediaBlobCacheEntry>>();

export function whatsappMediaBlobCacheKey(
  conversationId: string,
  messageId: string,
): string {
  return `${conversationId}:${messageId}`;
}

export function peekWhatsappMediaBlobCache(
  conversationId: string,
  messageId: string,
): { objectUrl: string; contentType: string } | null {
  const key = whatsappMediaBlobCacheKey(conversationId, messageId);
  const entry = entries.get(key);
  if (!entry) {
    return null;
  }
  entry.lastAccessAt = Date.now();
  return { objectUrl: entry.objectUrl, contentType: entry.contentType };
}

function evictIfNeeded(): void {
  let totalBytes = 0;
  for (const entry of entries.values()) {
    totalBytes += entry.byteSize;
  }

  while (
    entries.size > MAX_ENTRIES ||
    totalBytes > MAX_TOTAL_BYTES
  ) {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;
    for (const [key, entry] of entries) {
      if (entry.refCount > 0) {
        continue;
      }
      if (entry.lastAccessAt < oldestAccess) {
        oldestAccess = entry.lastAccessAt;
        oldestKey = key;
      }
    }
    if (!oldestKey) {
      break;
    }
    const removed = entries.get(oldestKey);
    if (removed) {
      URL.revokeObjectURL(removed.objectUrl);
      totalBytes -= removed.byteSize;
    }
    entries.delete(oldestKey);
  }
}

export function acquireWhatsappMediaBlobCache(
  conversationId: string,
  messageId: string,
): { objectUrl: string; contentType: string } | null {
  const key = whatsappMediaBlobCacheKey(conversationId, messageId);
  const entry = entries.get(key);
  if (!entry) {
    return null;
  }
  entry.refCount += 1;
  entry.lastAccessAt = Date.now();
  return { objectUrl: entry.objectUrl, contentType: entry.contentType };
}

export function releaseWhatsappMediaBlobCache(
  conversationId: string,
  messageId: string,
): void {
  const key = whatsappMediaBlobCacheKey(conversationId, messageId);
  const entry = entries.get(key);
  if (!entry) {
    return;
  }
  entry.refCount = Math.max(0, entry.refCount - 1);
  entry.lastAccessAt = Date.now();
  evictIfNeeded();
}

export function storeWhatsappMediaBlobCache(
  conversationId: string,
  messageId: string,
  blob: Blob,
  contentType: string,
): WhatsappMediaBlobCacheEntry {
  const key = whatsappMediaBlobCacheKey(conversationId, messageId);
  const existing = entries.get(key);
  if (existing) {
    existing.lastAccessAt = Date.now();
    return existing;
  }

  const objectUrl = URL.createObjectURL(blob);
  const entry: WhatsappMediaBlobCacheEntry = {
    blob,
    contentType,
    objectUrl,
    refCount: 0,
    byteSize: blob.size,
    lastAccessAt: Date.now(),
  };
  entries.set(key, entry);
  evictIfNeeded();
  return entry;
}

export function getWhatsappMediaInflight(
  conversationId: string,
  messageId: string,
): Promise<WhatsappMediaBlobCacheEntry> | null {
  const key = whatsappMediaBlobCacheKey(conversationId, messageId);
  return inflight.get(key) ?? null;
}

export function setWhatsappMediaInflight(
  conversationId: string,
  messageId: string,
  promise: Promise<WhatsappMediaBlobCacheEntry>,
): void {
  const key = whatsappMediaBlobCacheKey(conversationId, messageId);
  inflight.set(key, promise);
  void promise.finally(() => {
    if (inflight.get(key) === promise) {
      inflight.delete(key);
    }
  });
}

/** Test helper */
export function clearWhatsappMediaBlobCache(): void {
  for (const entry of entries.values()) {
    URL.revokeObjectURL(entry.objectUrl);
  }
  entries.clear();
  inflight.clear();
}
