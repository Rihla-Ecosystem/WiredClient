"use client";

interface RiskGaugeProps {
  level: "low" | "moderate" | "high" | "critical";
  score: number;
}

const GAUGE_CONFIG = {
  low: { color: "bg-green-500", text: "text-green-600 dark:text-green-400", label: "Low" },
  moderate: { color: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400", label: "Moderate" },
  high: { color: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", label: "High" },
  critical: { color: "bg-red-600", text: "text-red-600 dark:text-red-400", label: "Critical" },
};

export function RiskGauge({ level, score }: RiskGaugeProps) {
  const cfg = GAUGE_CONFIG[level];

  return (
    <div className="bg-white dark:bg-nile rounded-xl border border-sand/50 dark:border-nile-light/20 p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Overall Risk Level
      </h3>
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-sand/50 dark:text-nile-light/30"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${(score / 100) * 339.292} 339.292`}
              strokeLinecap="round"
              className={cfg.color}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-3xl font-bold ${cfg.text}`}>{score}</span>
          </div>
        </div>
        <span
          className={`text-lg font-semibold ${cfg.text}`}
        >
          {cfg.label}
        </span>
      </div>
    </div>
  );
}
