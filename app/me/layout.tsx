
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { Suspense } from "react";
import { GraduationCap, History, Heart, Menu, LayoutDashboard } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-2 items-center">
        {/* Modern Navbar */}
        <nav className="w-full sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/40">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <a href="/me" className="flex items-center gap-2.5 shrink-0 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none tracking-tight">ACGS</span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5 hidden sm:block">Career Guidance</span>
              </div>
            </a>

            <div className="hidden md:flex items-center gap-1 bg-muted/50 rounded-full px-1.5 py-1">
              <NavLink href="/me" icon={<LayoutDashboard className="h-3.5 w-3.5" />}>
                Dashboard
              </NavLink>
              <NavLink href="/me/assessment" icon={<GraduationCap className="h-3.5 w-3.5" />}>
                Assessment
              </NavLink>
              <NavLink href="/me/history" icon={<History className="h-3.5 w-3.5" />}>
                History
              </NavLink>
              <NavLink href="/me/saved" icon={<Heart className="h-3.5 w-3.5" />}>
                Saved
              </NavLink>
            </div>

            {/* Right side: Auth + Mobile menu */}
            <div className="flex items-center gap-3">
              {!hasEnvVars ? (
                <EnvVarWarning />
              ) : (
                <Suspense>
                  <AuthButton />
                </Suspense>
              )}
              
              {/* Mobile menu toggle */}
              <MobileNav />
            </div>
          </div>
        </nav>

        <div className="flex-1 flex flex-col gap-2 max-w-5xl w-full p-5">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t border-border/40 mx-auto text-center text-xs gap-8 py-12 px-4">
          <p className="text-muted-foreground">© 2026 AI Career Guidance System</p>
          <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy & POPIA</a>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-full transition-all"
    >
      {icon}
      {children}
    </a>
  );
}

function MobileNav() {
  return (
    <div className="md:hidden relative group">
      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
        <Menu className="h-5 w-5 text-muted-foreground" />
      </button>
      {/* Dropdown on hover/focus-within */}
      <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-xl border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 p-2 space-y-1 z-50">
        <a
          href="/me"
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </a>
        <a
          href="/me/assessment"
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <GraduationCap className="h-4 w-4" />
          Assessment
        </a>
        <a
          href="/me/history"
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <History className="h-4 w-4" />
          History
        </a>
        <a
          href="/me/saved"
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <Heart className="h-4 w-4" />
          Saved Careers
        </a>
        <div className="border-t border-border my-1" />
        <a
          href="/privacy"
          className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          Privacy & POPIA
        </a>
      </div>
    </div>
  );
}
