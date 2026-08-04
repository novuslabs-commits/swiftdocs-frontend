"use client";
import { FileText, Target, Layers, Zap } from "lucide-react";
import { Stat } from "@/components/ui/stat";
import type { Metrics } from "@/types";

interface Props {
  metrics: Metrics;
  totalFieldsFound: number;
}

export default function MetricsCards({ metrics, totalFieldsFound }: Props) {
  const accuracy = metrics.average_confidence
    ? `${Math.round(metrics.average_confidence * 100)}%`
    : "—";
  const avgTime = metrics.average_processing_time_ms
    ? `${(metrics.average_processing_time_ms / 1000).toFixed(1)}s`
    : "—";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      <Stat
        label="Docs Extracted"
        value={metrics.completed}
        sub="successfully processed"
        icon={<FileText size={18} />}
      />
      <Stat
        label="Avg Accuracy"
        value={accuracy}
        sub="across extracted fields"
        icon={<Target size={18} />}
      />
      <Stat
        label="Fields Found"
        value={totalFieldsFound.toLocaleString()}
        sub="data points captured"
        icon={<Layers size={18} />}
      />
      <Stat
        label="Avg Speed"
        value={avgTime}
        sub="per document"
        icon={<Zap size={18} />}
      />
    </div>
  );
}
