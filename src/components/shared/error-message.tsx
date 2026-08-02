import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 text-center",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-white gradient-gold rounded-lg hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
