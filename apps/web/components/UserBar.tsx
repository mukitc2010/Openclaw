"use client";

import { useAuth } from "@/components/AuthProvider";
import { isAuthEnabled } from "@/lib/supabase";

export function UserBar() {
  const { user, loading, signOut } = useAuth();

  if (!isAuthEnabled) return null;
  if (loading) return null;

  if (!user) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, paddingTop: 4 }}>
      <span style={{ color: "var(--muted)" }}>{user.email}</span>
      <button onClick={signOut} style={{ padding: "4px 12px", fontSize: 13 }}>
        Sign out
      </button>
    </div>
  );
}
