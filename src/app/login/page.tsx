import { signInWithMagicLink } from "@/lib/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="w-full max-w-md bg-surface-container-low rounded-xl p-8">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
          Carnitez Trading
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Sign in with a magic link — no password required.
        </p>

        <form action={signInWithMagicLink} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-on-surface-variant">
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-3 text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:border-primary"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-3 transition-all active:scale-[0.98] hover:brightness-110"
          >
            Send magic link
          </button>
        </form>

        {params.sent && (
          <p className="mt-6 text-sm text-secondary">
            Check your email — we sent you a sign-in link.
          </p>
        )}
        {params.error && (
          <p className="mt-6 text-sm text-error">{params.error}</p>
        )}
      </div>
    </main>
  );
}
