import { NextRequest, NextResponse } from "next/server";
import { isAuthConfigured } from "./config";
import { createClient } from "./server";

export async function requireInterviewUser(request: NextRequest) {
  if (!isAuthConfigured()) {
    if (process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1"].includes(request.nextUrl.hostname)) return null;
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    if (!error && data?.claims) return null;
  } catch { /* Treat verification failures as unauthenticated. */ }
  return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
}
