import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-heading font-bold text-gradient mb-4">
          404
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          This page does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 text-sm font-medium text-white gradient-gold rounded-lg hover:opacity-90 transition-opacity"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
