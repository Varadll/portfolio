"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  role: "admin" | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isLoading: true,
  signOut: async () => {},
});

// Admin role is determined purely by email (no DB roundtrip, can't hang).
// Set NEXT_PUBLIC_ADMIN_EMAIL in .env.local and in Netlify env.
function resolveRole(user: User | null): "admin" | null {
  if (!user?.email) return null;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!adminEmail) {
    // Fail closed — without config, nobody is admin.
    // The corresponding server env var (ADMIN_EMAIL) would also be missing,
    // so any admin API call would 500. This log makes the misconfig obvious.
    if (typeof window !== "undefined") {
      console.warn(
        "[AuthContext] NEXT_PUBLIC_ADMIN_EMAIL not set — admin gate locked"
      );
    }
    return null;
  }
  return user.email.toLowerCase() === adminEmail.toLowerCase() ? "admin" : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (cancelled) return;
        const user = session?.user ?? null;
        setState({ user, role: resolveRole(user), isLoading: false });
      } catch (err) {
        if (cancelled) return;
        console.error("[AuthContext] getSession failed", err);
        setState({ user: null, role: null, isLoading: false });
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setState({ user, role: resolveRole(user), isLoading: false });
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, role: null, isLoading: false });
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
