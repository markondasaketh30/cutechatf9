"use server";

import crypto from "crypto";
import { z } from "zod";

import {
  createPasswordResetToken,
  getPasswordResetToken,
  getUser,
  invalidatePasswordResetToken,
  logActivity,
  updateUserPassword,
} from "@/lib/db/queries";
import { sendPasswordResetEmail } from "@/lib/email";

// Strong password validation schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character"
  );

const requestResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(32, "Invalid reset token"),
  password: passwordSchema,
});

export type RequestResetState = {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "invalid_data"
    | "rate_limited";
  message?: string;
};

export type ResetPasswordState = {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "invalid_data"
    | "token_expired"
    | "token_invalid";
  message?: string;
  errors?: Record<string, string[]>;
};

/**
 * Request a password reset email
 * Always returns success to prevent email enumeration attacks
 */
export async function requestPasswordReset(
  _: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  try {
    const validationResult = requestResetSchema.safeParse({
      email: formData.get("email"),
    });

    if (!validationResult.success) {
      return {
        status: "invalid_data",
        message: validationResult.error.errors[0]?.message,
      };
    }

    const { email } = validationResult.data;
    const [user] = await getUser(email);

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate secure random token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt,
      });

      // Log the password reset request
      await logActivity({
        userId: user.id,
        action: "password_reset_requested",
        metadata: { email },
      });

      // Send the email
      const emailResult = await sendPasswordResetEmail(email, token);

      if (!emailResult.success) {
        console.error("Failed to send password reset email:", emailResult.error);
        // Still return success to prevent enumeration
      }
    }

    return {
      status: "success",
      message:
        "If an account exists with that email, a password reset link has been sent.",
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return {
      status: "failed",
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}

/**
 * Reset password using a valid token
 */
export async function resetPassword(
  _: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  try {
    const validationResult = resetPasswordSchema.safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
    });

    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });

      return {
        status: "invalid_data",
        message: "Please check the form for errors",
        errors,
      };
    }

    const { token, password } = validationResult.data;

    // Get and validate token
    const resetToken = await getPasswordResetToken(token);

    if (!resetToken) {
      return {
        status: "token_invalid",
        message: "Invalid or expired reset link. Please request a new one.",
      };
    }

    // Check if token was already used
    if (resetToken.usedAt) {
      return {
        status: "token_invalid",
        message: "This reset link has already been used. Please request a new one.",
      };
    }

    // Check if token has expired
    if (new Date() > resetToken.expiresAt) {
      return {
        status: "token_expired",
        message: "This reset link has expired. Please request a new one.",
      };
    }

    // Update the password
    await updateUserPassword(resetToken.userId, password);

    // Invalidate the token
    await invalidatePasswordResetToken(token);

    // Log the password reset
    await logActivity({
      userId: resetToken.userId,
      action: "password_reset_completed",
    });

    return {
      status: "success",
      message: "Your password has been reset successfully. You can now sign in.",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      status: "failed",
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}
