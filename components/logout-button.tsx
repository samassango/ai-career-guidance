"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <button
      onClick={logout}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}
