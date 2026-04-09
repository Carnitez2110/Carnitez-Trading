import "@testing-library/jest-dom";

// Dummy Supabase env vars so code paths guarded by env-presence checks
// run during tests. Real calls are mocked in the relevant test files.
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "test-anon-key";
