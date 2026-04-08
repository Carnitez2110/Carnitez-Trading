import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "nested" | "glass";
  className?: string;
}

export function Card({ children, variant = "default", className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl",
        variant === "default" && "bg-surface-container-low p-6",
        variant === "nested" && "bg-surface-container-high rounded-lg p-6",
        variant === "glass" && "glass-panel p-6 relative overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}
