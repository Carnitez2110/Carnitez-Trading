import { cn } from "@/lib/utils";

interface ConfidenceRingProps {
  percentage: number;
  size?: number;
  className?: string;
}

export function ConfidenceRing({ percentage, size = 128, className }: ConfidenceRingProps) {
  const radius = (size / 2) - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const ringColor = percentage >= 70 ? "text-secondary" : percentage >= 40 ? "text-tertiary" : "text-error";

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="text-surface-container-highest"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
        />
        <circle
          className={ringColor}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold font-headline">{percentage}%</span>
        <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
          Confidence
        </span>
      </div>
    </div>
  );
}
