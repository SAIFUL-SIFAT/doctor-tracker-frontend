"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Lock, Mail, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const next = rawNext && rawNext !== "/" && rawNext !== "/login" ? rawNext : "/dashboard";

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await apiClient("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });

      toast.success("Welcome back!", {
        description: "Successfully authenticated to ward admin.",
      });

      router.replace(next);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Failed to sign in. Please try again.");
      }
    }
  };

  const handleFillDemo = () => {
    setValue("email", "admin@example.com");
    setValue("password", "ChangeMe123!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--canvas)] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--ink)] shadow-md ring-4 ring-teal-500/10 p-2.5">
            <img src="/logo.svg" alt="Doctor Tracker Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)] font-heading">
            Doctor Tracker
          </h1>
          <p className="text-sm text-[var(--muted-text)]">
            Clinical ward administration and doctor workload monitoring
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-[var(--line)] shadow-lg bg-[var(--surface)]">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold text-[var(--ink)] font-heading">
              Sign In to Ward Console
            </CardTitle>
            <CardDescription className="text-xs text-[var(--muted-text)]">
              Enter your authorized staff credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {serverError && (
              <div className="flex items-center gap-2 p-3 text-sm text-[var(--rose)] bg-rose-50 border border-rose-200 rounded-md">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--ink)] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--muted-text)]" />
                  Email Address
                </label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className="bg-white border-[var(--line)] text-sm focus-visible:ring-1 focus-visible:ring-[var(--teal)]"
                />
                {errors.email && (
                  <p className="text-xs text-[var(--rose)]">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--ink)] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[var(--muted-text)]" />
                    Password
                  </label>
                </div>
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="bg-white border-[var(--line)] text-sm focus-visible:ring-1 focus-visible:ring-[var(--teal)]"
                />
                {errors.password && (
                  <p className="text-xs text-[var(--rose)]">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[var(--teal)] hover:bg-[#096662] text-white font-medium py-2 rounded-md shadow-sm transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="pt-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--line)]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[var(--surface)] px-2 text-[var(--muted-text)] font-medium">
                    Demo Environment
                  </span>
                </div>
              </div>

              <div className="mt-3 bg-[var(--teal-soft)]/50 border border-[var(--teal)]/20 rounded-lg p-3 text-xs text-[var(--ink)]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[var(--teal)]">Default Admin:</span>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-[var(--teal)] hover:underline font-medium hover:text-[#096662]"
                  >
                    Auto-fill
                  </button>
                </div>
                <div className="font-mono text-[11px] text-[var(--muted-text)] space-y-0.5">
                  <div>Email: admin@example.com</div>
                  <div>Password: ChangeMe123!</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--canvas)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--teal)]" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
