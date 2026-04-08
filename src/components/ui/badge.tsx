import { cn } from "@/lib/utils";

type Sentiment = "bullish" | "bearish" | "neutral";

interface BadgeProps {
  sentiment: Sentiment;
  className?: string;
}

const sentimentStyles: Record<Sentiment, string> = {
  bullish: "bg-secondary/10 text-secondary border-secondary/20",
  bearish: "bg-error/10 text-error border-error/20",
  neutral: "bg-outline/10 text-outline border-outline/20",
};

const sentimentLabels: Record<Sentiment, string> = {
  bullish: "BULLISH",
  bearish: "BEARISH",
  neutral: "NEUTRAL",
};

export function Badge({ sentiment, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border",
        sentimentStyles[sentiment],
        className
      )}
    >
      {sentimentLabels[sentiment]}
    </span>
  );
}
