import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Initialize Clerk middleware safely. If Clerk throws during init (for
// example because the publishable key is invalid) we fall back to a
// no-op middleware so the application doesn't crash in development.
let safeMiddleware: any;
try {
  safeMiddleware = clerkMiddleware();
} catch (err: any) {
  // Log error for visibility but continue with a passthrough middleware
  // so the rest of the app remains functional.
  // eslint-disable-next-line no-console
  console.error("Clerk middleware initialization failed:", err?.message || err);
  safeMiddleware = () => (req: any) => NextResponse.next();
}

// Next.js requires the proxy file to export either a default function or a
// named `proxy` function. Export `proxy` which delegates to the initialized
// middleware (or the no-op fallback).
export async function proxy(req: Request) {
  return safeMiddleware(req);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
