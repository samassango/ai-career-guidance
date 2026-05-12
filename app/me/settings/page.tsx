"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Lock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength checks
  const checks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  };
  const strength = Object.values(checks).filter(Boolean).length;
  const strengthLabel = strength <= 1 ? "Weak" : strength <= 2 ? "Fair" : strength <= 3 ? "Good" : "Strong";
  const strengthColor = strength <= 1 ? "bg-red-500" : strength <= 2 ? "bg-amber-500" : strength <= 3 ? "bg-blue-500" : "bg-emerald-500";
  const strengthTextColor = strength <= 1 ? "text-red-500" : strength <= 2 ? "text-amber-500" : strength <= 3 ? "text-blue-500" : "text-emerald-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (strength < 3) {
      setError("Please use a stronger password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-start justify-center pt-8">
      <div className="w-full max-w-md">
        <Link
          href="/me"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Assessment
        </Link>

        <div className="bg-card rounded-xl p-6 card-shadow">
          {/* Header */}
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Change Password</h1>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
          </div>

          {/* Success State */}
          {success && (
            <div className="mt-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
              <Check className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-600">Password updated successfully!</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your new password is now active.</p>
              </div>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* New Password */}
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="text-sm font-medium">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength */}
                {newPassword.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              i <= strength ? strengthColor : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-medium ${strengthTextColor}`}>
                        {strengthLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { key: "length", label: "8+ characters" },
                        { key: "uppercase", label: "Uppercase letter" },
                        { key: "lowercase", label: "Lowercase letter" },
                        { key: "number", label: "Number" },
                      ].map((check) => (
                        <div
                          key={check.key}
                          className={`flex items-center gap-1.5 text-xs transition-colors ${
                            checks[check.key as keyof typeof checks]
                              ? "text-emerald-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          {check.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className={`w-full px-3 py-2.5 pr-10 text-sm rounded-lg border bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      confirmPassword.length > 0 && confirmPassword !== newPassword
                        ? "border-red-400 focus:border-red-400"
                        : "border-border focus:border-primary/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Passwords don&apos;t match
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || newPassword.length === 0 || confirmPassword.length === 0}
                className="w-full py-2.5 px-4 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {/* Change again after success */}
          {success && (
            <button
              onClick={() => setSuccess(false)}
              className="mt-4 w-full py-2.5 px-4 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-all"
            >
              Change Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
