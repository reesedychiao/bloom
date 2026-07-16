import type { ReactNode } from "react";
import { useSession } from "./useSession";
import { SignIn } from "./SignIn";

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-canvas">
        <p className="font-display text-lg text-ink-soft">Bloom</p>
      </main>
    );
  }

  if (!session) return <SignIn />;

  return <>{children}</>;
}
