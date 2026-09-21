import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, AudioLines, LockKeyhole, Sparkles } from "lucide-react";
import { signIn, signUp } from "@/app/auth/actions";
import { isAuthConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const errors: Record<string, string> = { setup: "Authentication needs a Supabase project before accounts can be used.", required: "Enter your email and password.", invalid: "Those credentials did not work. Try again or create an account.", password: "Use a password with at least 8 characters.", signup: "Could not create that account. Check your email and password, then try again.", confirm: "That confirmation link could not be verified. Try signing in or requesting a new email." };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ mode?: string; error?: string; notice?: string }> }) {
  const params = await searchParams;
  const signup = params.mode === "signup";
  const configured = isAuthConfigured();
  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims) redirect("/interview");
  }
  return <div className="auth-page"><header className="landing-header"><Link className="brand" href="/"><span className="brand-mark"><AudioLines size={22}/></span><span>interview<span className="brand-light">ly</span><span className="brand-dot">.</span></span></Link><Link className="auth-back" href="/"><ArrowLeft size={16}/> Back to home</Link></header>
    <main className="auth-main"><div className="auth-copy"><span className="eyebrow"><span className="eyebrow-line"/> YOUR PRACTICE SPACE</span><h1>Feel ready<br/><em>for what’s next.</em></h1><p>Practice the questions that matter for your role. Learn from each answer and see your progress.</p><div className="auth-quote"><Sparkles size={19}/><span>A little practice can change how you show up.</span></div></div>
      <section className="auth-card"><div className="auth-symbol"><LockKeyhole size={21}/></div><span className="section-index">{signup ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}</span><h2>{signup ? "Make room to grow." : "Pick up where you left off."}</h2><p>{signup ? "Create an account to start your interview practice." : "Sign in to continue your practice."}</p>
        {!configured && <div className="auth-alert">Account login is waiting for Supabase setup. You can still try the local interview preview.</div>}
        {params.error && <div className="auth-alert error-alert">{errors[params.error] || "Something went wrong. Try again."}</div>}
        {params.notice === "confirm" && <div className="auth-alert">Check your email for a confirmation link, then come back to sign in.</div>}
        <form action={signup ? signUp : signIn} className="auth-form"><label htmlFor="email">EMAIL ADDRESS</label><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required disabled={!configured}/><label htmlFor="password">PASSWORD</label><input id="password" name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 8 : undefined} placeholder={signup ? "At least 8 characters" : "Your password"} required disabled={!configured}/><button className="primary-button" type="submit" disabled={!configured}>{signup ? "Create account" : "Log in"}<ArrowRight size={17}/></button></form>
        <div className="auth-switch">{signup ? "Already have an account?" : "New here?"} <Link href={signup ? "/login" : "/login?mode=signup"}>{signup ? "Log in" : "Create account"}</Link></div>
        {!configured && process.env.NODE_ENV === "development" && <Link className="preview-link" href="/interview">Continue to local preview <ArrowRight size={15}/></Link>}
      </section></main><footer className="landing-footer">© {new Date().getFullYear()} INTERVIEWLY <span>PREPARE WITH PURPOSE ↗</span></footer>
  </div>;
}
