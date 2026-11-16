// Shared loading / error blocks so every page handles both the same way.
export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
      Could not load data: {message}
    </p>
  );
}

export function LoadingBlock({ height = 'h-64' }) {
  return <div className={`card animate-pulse ${height}`} aria-label="Loading" />;
}