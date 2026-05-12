import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { GraduationCap } from "lucide-react";
import { TutorialStep } from "@/components/tutorial/tutorial-step";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <a href={"/"}>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg hero-gradient flex items-center justify-center bg-primary text-primary-foreground">
                  <GraduationCap className="h-5 w-5 text-primary-foreground bg-primary text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">ACGS</span>
              </div>
            </a>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <a href={"/how-it-works"} className="hover:text-foreground transition-colors">How It Works</a>
              {/* <a href="/mission" className="hover:text-foreground transition-colors">Vission</a> */}
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <Hero />
          <main className="flex-1 flex flex-col gap-6 px-4">
            <h2 className="font-medium text-xl mb-4">Next steps</h2>
            <ol className="flex flex-col gap-6">
              <TutorialStep title="Sign up to start your Assessment">
                <p>
                  Head over to the{" "}
                  <Link
                    href="auth/sign-up"
                    className="font-bold hover:underline text-foreground/80"
                  >
                    Sign up
                  </Link>{" "}
                  page and sign up. It&apos;s okay if it's your first time.
                </p>
              </TutorialStep>
            </ol>
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>© 2026 AI Career Guidance System. Helping learners make informed career decisions.</p>
          <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy & POPIA</a>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
