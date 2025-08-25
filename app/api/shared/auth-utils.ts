import { NextRequest, NextResponse } from "next/server";

// Function to check if a request is authenticated by checking for an admin_session cookie
export function isAuthenticated(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get("admin_session");
  return !!sessionCookie;
}

// Helper function to return an unauthorized response
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized access" },
    { status: 401 }
  );
}
