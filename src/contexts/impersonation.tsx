'use client';

import dynamic from 'next/dynamic';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { clearViewOrgCookie, type ViewOrgCookie } from '@/lib/platform/impersonation-cookie';
import { stopImpersonation } from '@/lib/api/platform';

const ImpersonationRouterBridge = dynamic(
  () => import('./impersonation-router-bridge'),
  { ssr: false },
);

interface ImpersonationContextValue {
  organization: ViewOrgCookie | null;
  isImpersonating: boolean;
  exitImpersonation: () => Promise<void>;
}

const ImpersonationContext = createContext<ImpersonationContextValue>({
  organization: null,
  isImpersonating: false,
  exitImpersonation: async () => {},
});

export function ImpersonationProvider({
  organization,
  children,
}: {
  organization: ViewOrgCookie | null;
  children: ReactNode;
}) {
  const navigateRef = useRef<((path: string) => void) | null>(null);

  const registerNavigate = useCallback((navigate: (path: string) => void) => {
    navigateRef.current = navigate;
  }, []);

  const exitImpersonation = useCallback(async () => {
    try {
      await stopImpersonation(organization?.organizationId);
    } finally {
      clearViewOrgCookie();
      navigateRef.current?.('/platform/tenants');
    }
  }, [organization?.organizationId]);

  const value = useMemo(
    () => ({
      organization,
      isImpersonating: organization !== null,
      exitImpersonation,
    }),
    [organization, exitImpersonation],
  );

  return (
    <ImpersonationContext.Provider value={value}>
      <ImpersonationRouterBridge onReady={registerNavigate} />
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation(): ImpersonationContextValue {
  return useContext(ImpersonationContext);
}

export function useActiveOrganization(): ViewOrgCookie | null {
  const { organization: impersonatedOrganization } = useImpersonation();
  return impersonatedOrganization;
}
