import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  children: React.ReactNode;
}

export function Button({ variant = "primary", children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-bold rounded-xl transition-all active:scale-95",
        variant === "primary" &&
          "bg-approve-gradient text-on-primary shadow-lg shadow-primary/10 hover:brightness-110",
        variant === "ghost" &&
          "border border-outline-variant/30 text-on-surface hover:bg-surface-container-highest",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
