import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { Settings, ChevronDown } from "lucide-react";

export async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  if (!user) {
    return (
      <div className="flex gap-2">
        <Link
          href="/auth/login"
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/auth/sign-up"
          className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const email = user.email as string;
  const initials = email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative group">
      {/* Trigger */}
      <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium leading-none truncate max-w-[150px]">
            {email.split("@")[0]}
          </p>
          <p className="text-[11px] text-muted-foreground leading-none mt-0.5 truncate max-w-[150px]">
            {email}
          </p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-1.5 w-56 bg-card rounded-xl border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50 overflow-hidden">
        {/* User info header */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <p className="text-sm font-medium truncate">{email.split("@")[0]}</p>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>

        <div className="p-1.5">
          <a
            href="/me/settings"
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
            Change Password
          </a>

          <div className="my-1 border-t border-border" />

          <div className="px-1 py-0.5">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
