import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner className="w-8 h-8" />
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
