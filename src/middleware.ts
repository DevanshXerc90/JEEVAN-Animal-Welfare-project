import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup", "/verify-code"]);
const PUBLIC_FILE = /\.[^/]+$/;

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Never run auth redirects for API routes, Next.js internals, or static files.
    if (
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico" ||
        PUBLIC_FILE.test(pathname)
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get("token")?.value;
    const isPublicRoute = PUBLIC_ROUTES.has(pathname);

    // Logged-in users shouldn't see auth pages.
    if (token && (pathname === "/login" || pathname === "/signup" || pathname === "/verify-code")) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Unauthenticated users get sent to login for protected pages.
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Only match non-API, non-static routes.
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};