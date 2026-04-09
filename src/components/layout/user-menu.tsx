import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

export async function UserMenu() {
  // Dev bootstrap: if Supabase isn't configured yet, render nothing so the
  // rest of the shell is still explorable.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden md:inline text-sm text-on-surface-variant max-w-[160px] truncate">
        {user.email}
      </span>
      <form action={signOut}>
        <button
          type="submit"
          className="text-sm text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container-high"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
