'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ImpersonationRouterBridge({
  onReady,
}: {
  onReady: (navigate: (path: string) => void) => void;
}) {
  const router = useRouter();

  useEffect(() => {
    onReady((path) => {
      router.push(path);
      router.refresh();
    });
  }, [onReady, router]);

  return null;
}
