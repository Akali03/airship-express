"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";

export type CurrentUser = {
  id: string;
  email: string | null;
  fullName: string;
  role: string;
  initials: string;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function buildUser(authUser: { id: string; email?: string | null }) {
      const { data: employee, error } = await supabase
        .from("employees")
        .select("full_name, role, email")
        .eq("id", authUser.id)
        .maybeSingle();

      if (error) {
        console.error("Failed to load employee profile:", error);
      }

      const fullName =
        employee?.full_name || authUser.email?.split("@")[0] || "User";
      const role = employee?.role || "staff";

      if (!mounted) return;

      setUser({
        id: authUser.id,
        email: employee?.email ?? authUser.email ?? null,
        fullName,
        role,
        initials: fullName
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      });
      setLoading(false);
    }

    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        if (mounted) setLoading(false);
        return;
      }
      buildUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          buildUser(session.user);
        } else if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
