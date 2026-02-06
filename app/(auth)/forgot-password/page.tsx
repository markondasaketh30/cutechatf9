"use client";

import Form from "next/form";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { toast } from "@/components/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type RequestResetState,
  requestPasswordReset,
} from "../password-reset/actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<RequestResetState, FormData>(
    requestPasswordReset,
    { status: "idle" }
  );

  useEffect(() => {
    if (state.status === "success") {
      setIsSuccessful(true);
      toast({
        type: "success",
        description:
          state.message ||
          "If an account exists with that email, a reset link has been sent.",
      });
    } else if (state.status === "failed") {
      toast({
        type: "error",
        description: state.message || "Failed to process request. Please try again.",
      });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: state.message || "Please enter a valid email address.",
      });
    } else if (state.status === "rate_limited") {
      toast({
        type: "error",
        description: "Too many requests. Please try again later.",
      });
    }
  }, [state.status, state.message]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="font-semibold text-xl dark:text-zinc-50">
            Forgot Password
          </h3>
          <p className="text-gray-500 text-sm dark:text-zinc-400">
            Enter your email address and we&apos;ll send you a link to reset your
            password
          </p>
        </div>

        {isSuccessful ? (
          <div className="flex flex-col gap-4 px-4 sm:px-16">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-center text-green-800 text-sm dark:text-green-200">
                Check your email for a password reset link. If you don&apos;t see
                it, check your spam folder.
              </p>
            </div>
            <Link
              className="mt-4 text-center font-semibold text-gray-800 text-sm hover:underline dark:text-zinc-200"
              href="/login"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <Form action={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
            <div className="flex flex-col gap-2">
              <Label
                className="font-normal text-zinc-600 dark:text-zinc-400"
                htmlFor="email"
              >
                Email Address
              </Label>
              <Input
                autoComplete="email"
                autoFocus
                className="bg-muted text-md md:text-sm"
                defaultValue={email}
                id="email"
                name="email"
                placeholder="user@acme.com"
                required
                type="email"
              />
            </div>

            <SubmitButton isSuccessful={isSuccessful}>
              Send Reset Link
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
