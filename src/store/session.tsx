import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { StaffAccount } from '@/lib/types';
import {
  clearSession,
  readSession,
  verifySecret,
  writeSession,
  can,
  type Capability,
  type Session,
} from '@/lib/auth';
import { useClinic } from './clinic';

interface SessionApi {
  session: Session | null;
  signIn: (login: string, secret: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => void;
  can: (capability: Capability) => boolean;
}

const SessionContext = createContext<SessionApi | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { staff } = useClinic();
  const [session, setSession] = useState<Session | null>(() => readSession());

  const signIn = useCallback<SessionApi['signIn']>(
    async (login, secret) => {
      const account: StaffAccount | undefined = staff.find(
        (s) => s.login.toLowerCase() === login.trim().toLowerCase(),
      );
      if (!account) return { ok: false, error: 'invalidCredentials' };
      if (!account.active) return { ok: false, error: 'accountDisabled' };

      const valid = await verifySecret(account, secret);
      if (!valid) return { ok: false, error: 'invalidCredentials' };

      const next: Session = {
        staffId: account.id,
        name: account.name,
        login: account.login,
        role: account.role,
        startedAt: new Date().toISOString(),
      };
      writeSession(next);
      setSession(next);
      return { ok: true };
    },
    [staff],
  );

  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const api = useMemo<SessionApi>(
    () => ({
      session,
      signIn,
      signOut,
      can: (capability: Capability) => can(session?.role ?? null, capability),
    }),
    [session, signIn, signOut],
  );

  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionApi {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
