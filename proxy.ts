import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { guestRegex, isDevelopmentEnvironment } from "./lib/constants";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  "/api/auth/callback/credentials": { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  "/login": { maxRequests: 10, windowMs: 15 * 60 * 1000 },
  "/register": { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  "/forgot-password": { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  "/api/chat": { maxRequests: 60, windowMs: 60 * 1000 },
};

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

function checkRateLimit(
  ip: string,
  pathname: string
): { allowed: boolean; remaining: number; resetAt: Date } {
  const config = RATE_LIMITS[pathname];
  if (!config) {
    return { allowed: true, remaining: 100, resetAt: new Date() };
  }

  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const existing = rateLimitMap.get(key);

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now - v.timestamp > 3600000) {
        rateLimitMap.delete(k);
      }
    }
  }

  if (!existing || now - existing.timestamp > config.windowMs) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: new Date(now + config.windowMs),
    };
  }

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(existing.timestamp + config.windowMs),
    };
  }

  existing.count++;
  rateLimitMap.set(key, existing);

  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetAt: new Date(existing.timestamp + config.windowMs),
  };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  // Rate limiting for POST requests on specific endpoints
  if (request.method === "POST" && RATE_LIMITS[pathname]) {
    const ip = getClientIp(request);
    const { allowed, remaining, resetAt } = checkRateLimit(ip, pathname);

    if (!allowed) {
      return NextResponse.json(
        {
          code: "rate_limit:auth",
          message: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetAt.toISOString(),
            "Retry-After": Math.ceil(
              (resetAt.getTime() - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // For rate-limited paths that aren't auth paths, add headers and continue
    if (!pathname.startsWith("/api/auth")) {
      const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        secureCookie: !isDevelopmentEnvironment,
      });

      if (!token) {
        const redirectUrl = encodeURIComponent(request.url);
        return NextResponse.redirect(
          new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url)
        );
      }

      const response = NextResponse.next();
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
      response.headers.set("X-RateLimit-Reset", resetAt.toISOString());
      return response;
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", resetAt.toISOString());
    return response;
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (!token) {
    const redirectUrl = encodeURIComponent(request.url);

    return NextResponse.redirect(
      new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url)
    );
  }

  const isGuest = guestRegex.test(token?.email ?? "");

  if (token && !isGuest && ["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/chat/:id",
    "/api/:path*",
    "/login",
    "/register",
    "/forgot-password",

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
