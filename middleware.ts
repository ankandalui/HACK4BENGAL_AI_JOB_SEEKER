import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const { nextUrl } = req;
    const token = req.nextauth.token;

    const isAuthPage =
      nextUrl.pathname.startsWith("/signup") ||
      nextUrl.pathname.startsWith("/login");

    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (!isAuthPage && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // We'll handle redirection manually
    },
  }
);
