import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
  "/((?!api/register|api/auth|api/keep-alive|_next/static|_next/image|favicon.ico|login|register).*)",
],
};