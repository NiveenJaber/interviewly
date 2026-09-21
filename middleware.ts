import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAuthConfigured } from "@/lib/supabase/config";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (!isAuthConfigured()) return NextResponse.next();
  return updateSession(request);
}

export const config = { matcher: ["/interview/:path*", "/api/interview/:path*", "/api/resume/:path*"] };
