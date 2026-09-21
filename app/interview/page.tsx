import Link from "next/link";
import { redirect } from "next/navigation";
import InterviewApp from "@/components/interview-app";
import { signOut } from "@/app/auth/actions";
import { isAuthConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function InterviewPage() {
  let email = "";
  if (isAuthConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) redirect("/login");
    email = typeof data.claims.email === "string" ? data.claims.email : "Your account";
  } else if (process.env.NODE_ENV !== "development") redirect("/login?error=setup");

  return <>
    <div className="account-strip"><Link href="/">← Home</Link><span>{email || "Local preview · authentication setup pending"}</span>{email && <form action={signOut}><button type="submit">Log out</button></form>}</div>
    <InterviewApp/>
  </>;
}
