// Placeholder — will be replaced by `supabase gen types typescript --linked` output.
// Phase 2 uses an untyped Supabase client until we wire up the CLI with an access token.
// All clients currently fall back to `any` on row types; this is acceptable for auth flows
// because we only touch auth.getUser() and auth.signInWithOtp() in Phase 2.

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
