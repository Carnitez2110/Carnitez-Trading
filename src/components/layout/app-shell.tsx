import { TopNav } from "./top-nav";
import { SideNav } from "./side-nav";
import { BottomNav } from "./bottom-nav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden">
      {/* Background gradient blurs */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-secondary/5 blur-[120px] rounded-full" />
      </div>

      <TopNav />
      <SideNav />

      <main className="lg:ml-64 pt-6 px-8 pb-20 lg:pb-12 max-w-[1440px]">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
