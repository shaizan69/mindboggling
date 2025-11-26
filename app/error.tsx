"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-400">
          Something went wrong!
        </h2>
        <p className="text-gray-400 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

