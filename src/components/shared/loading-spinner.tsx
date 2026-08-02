import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("w-6 h-6 animate-spin text-primary-500", className)}
    />
  );
}
