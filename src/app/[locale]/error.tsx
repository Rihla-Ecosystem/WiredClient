"use client";

import { useEffect } from "react";
import { ErrorMessage } from "@/components/shared/error-message";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ErrorMessage
        message="Something went wrong. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
