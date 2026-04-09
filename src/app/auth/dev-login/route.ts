/**
 * DEV-ONLY login bypass. Takes a token_hash from Supabase's admin.generateLink
 * API and verifies it server-side, which sets the session cookies on our
 * domain (bypassing the PKCE flow that requires a browser-stored code_verifier).
 *
 * Guarded against production use: throws a 404 unless NODE_ENV === 'development'.
 *
 * Workflow:
 *   1. `node --env-file=.env.local gen-link.mjs` prints a URL pointing here
 *   2. Navigate the browser to that URL
 *   3. This route calls supabase.auth.verifyOtp({ token_hash, type: 'email' })
 *      which sets sb-* cookies and then we redirect to /
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const next = searchParams.get("next") ?? "/";

  if (!tokenHash) {
    return new NextResponse("Missing token_hash", { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "email",
  });

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
