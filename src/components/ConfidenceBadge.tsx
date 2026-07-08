import { Badge, confidenceVariant } from "@/components/ui/badge";

interface Props {
  score: number;
  showPercent?: boolean;
}

export default function ConfidenceBadge({ score, showPercent = true }: Props) {
  const pct = Math.round(score * 100);
  const variant = confidenceVariant(score);
  return (
    <Badge variant={variant}>
      {showPercent ? `${pct}%` : variant}
    </Badge>
  );
}
