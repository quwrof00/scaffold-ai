import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Define route types
  const isPublicRoute = pathname === "/";
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isApiRoute = pathname.startsWith("/api/");

  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute) {
    if (isLoggedIn) {
      const role = (req.auth?.user as any)?.role;
      if (role === "TEACHER") return NextResponse.redirect(new URL("/teacher", req.nextUrl));
      if (role === "PARENT") return NextResponse.redirect(new URL("/parent", req.nextUrl));
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  // Prevent Parents and Teachers from accessing student-specific pages
  if (isLoggedIn) {
    const role = (req.auth?.user as any)?.role;
    const isStudentRoute = pathname === "/dashboard" || pathname === "/history" || pathname === "/stuck-map";
    if (isStudentRoute && role === "TEACHER") {
      return NextResponse.redirect(new URL("/teacher", req.nextUrl));
    }
    if (isStudentRoute && role === "PARENT") {
      return NextResponse.redirect(new URL("/parent", req.nextUrl));
    }
  }

  // Redirect unauthenticated users to login for protected routes
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
