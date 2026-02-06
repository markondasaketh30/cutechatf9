"use client";

import Form from "next/form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useActionState, useEffect, useState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { toast } from "@/components/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type ResetPasswordState,
  resetPassword,
} from "../password-reset/actions";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex h-dvh w-screen items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSuccessful, setIsSuccessful] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [state, formAction] = useActionState<ResetPasswordState, FormData>(
    resetPassword,
    { status: "idle" }
  );

  useEffect(() => {
    if (state.status === "success") {
      setIsSuccessful(true);
      toast({
        type: "success",
        description:
          state.message || "Password reset successfully. Please sign in.",
      });
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else if (state.status === "token_expired") {
      toast({
        type: "error",
        description:
          state.message || "Reset link has expired. Please request a new one.",
      });
    } else if (state.status === "token_invalid") {
      toast({
        type: "error",
        description:
          state.message || "Invalid or already used reset link.",
      });
    } else if (state.status === "failed") {
      toast({
        type: "error",
        description: state.message || "Failed to reset password. Please try again.",
      });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: state.message || "Please check the form for errors.",
      });
    }
  }, [state.status, state.message, router]);

  const handleSubmit = (formData: FormData) => {
    const password = formData.get("password") as string;

    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      toast({
        type: "error",
        description: "Passwords do not match",
      });
      return;
    }

    setPasswordError("");
    formAction(formData);
  };

  // If no token, show error
  if (!token) {
    return (
      <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
        <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
            <h3 className="font-semibold text-xl dark:text-zinc-50">
              Invalid Reset Link
            </h3>
            <p className="text-gray-500 text-sm dark:text-zinc-400">
              This password reset link is invalid or has expired.
            </p>
          </div>
          <div className="flex flex-col gap-4 px-4 sm:px-16">
            <Link
              className="w-full rounded-md bg-primary px-4 py-2 text-center font-medium text-primary-foreground hover:bg-primary/90"
              href="/forgot-password"
            >
              Request New Reset Link
            </Link>
            <Link
              className="text-center font-semibold text-gray-800 text-sm hover:underline dark:text-zinc-200"
              href="/login"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="font-semibold text-xl dark:text-zinc-50">
            Reset Password
          </h3>
          <p className="text-gray-500 text-sm dark:text-zinc-400">
            Enter your new password below
          </p>
        </div>

        {isSuccessful ? (
          <div className="flex flex-col gap-4 px-4 sm:px-16">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-center text-green-800 text-sm dark:text-green-200">
                Your password has been reset successfully. Redirecting to sign
                in...
              </p>
            </div>
          </div>
        ) : (
          <Form action={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
            <input type="hidden" name="token" value={token} />

            <div className="flex flex-col gap-2">
              <Label
                className="font-normal text-zinc-600 dark:text-zinc-400"
                htmlFor="password"
              >
                New Password
              </Label>
              <Input
                autoFocus
                className="bg-muted text-md md:text-sm"
                id="password"
                minLength={8}
                name="password"
                placeholder="Enter new password"
                required
                type="password"
              />
              {state.errors?.password && (
                <ul className="list-disc pl-4 text-red-500 text-xs">
                  {state.errors.password.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              )}
              <p className="text-gray-400 text-xs">
                Password must be at least 8 characters and contain uppercase,
                lowercase, number, and special character.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                className="font-normal text-zinc-600 dark:text-zinc-400"
                htmlFor="confirmPassword"
              >
                Confirm New Password
              </Label>
              <Input
                className="bg-muted text-md md:text-sm"
                id="confirmPassword"
                minLength={8}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError("");
                }}
                placeholder="Confirm new password"
                required
                type="password"
                value={confirmPassword}
              />
              {passwordError && (
                <p className="text-red-500 text-xs">{passwordError}</p>
              )}
            </div>

            <SubmitButton isSuccessful={isSuccessful}>
              Reset Password
            </SubmitButton>

            <p className="mt-4 text-center text-gray-600 text-sm dark:text-zinc-400">
              Remember your password?{" "}
              <Link
                className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
                href="/login"
              >
                Sign in
              </Link>
            </p>
          </Form>
        )}
      </div>
    </div>
  );
}
