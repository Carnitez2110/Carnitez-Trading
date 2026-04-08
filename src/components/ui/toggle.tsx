"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "w-10 h-5 rounded-full relative transition-colors",
        checked ? "bg-primary shadow-inner" : "bg-surface-container-highest",
        className
      )}
    >
      <div
        className={cn(
          "absolute top-1 w-3 h-3 rounded-full transition-all",
          checked ? "right-1 bg-white" : "left-1 bg-outline"
        )}
      />
    </button>
  );
}
