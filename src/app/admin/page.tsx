"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  const { user, role, isLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/admin/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user || role !== "admin") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Access Denied</h1>
          <p className="mt-2 text-muted">
            You don&apos;t have permission to access this page.
          </p>
          {user && (
            <p className="mt-1 text-xs text-muted">
              Logged in as: {user.email}
            </p>
          )}
          <button
            onClick={async () => {
              await signOut();
              router.push("/admin/login");
            }}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
