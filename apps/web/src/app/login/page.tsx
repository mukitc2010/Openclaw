"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase, isAuthEnabled } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isAuthEnabled) {
    return (
      <div className="login-layout page-enter">
        <section className="card login-card reveal">
          <p className="eyebrow">Authentication</p>
          <h2 className="section-title">Auth not configured</h2>
          <p className="state-text">
          Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
          <code>.env.local</code> to enable Supabase authentication.
          </p>
          <button onClick={() => router.push("/")}>Back to dashboard</button>
        </section>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase!.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="login-layout page-enter">
      <section className="card login-card reveal">
        <p className="eyebrow">Authentication</p>
        <h2 className="section-title">Sign in to OpenClaw</h2>
        <p className="state-text">Use your Supabase credentials to access your projects and generation workflows.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@company.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter password"
            />
          </label>

          {error && <p className="state-text danger">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}
