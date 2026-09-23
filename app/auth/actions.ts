"use server";

import { redirect } from "next/navigation";
import { isAuthConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  if (!isAuthConfigured()) redirect("/login?error=setup");
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) redirect("/login?error=required");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=invalid");
  redirect("/interview");
}

export async function signInWithGoogle() {
  if (!isAuthConfigured()) redirect("/login?error=setup");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/confirm` },
  });
  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}

export async function signUp(formData: FormData) {
  if (!isAuthConfigured()) redirect("/login?error=setup&mode=signup");
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || password.length < 8) redirect("/login?error=password&mode=signup");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/confirm` } });
  if (error) redirect("/login?error=signup&mode=signup");
  if (data.session) redirect("/interview");
  redirect("/login?notice=confirm");
}

export async function signOut() {
  if (isAuthConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
