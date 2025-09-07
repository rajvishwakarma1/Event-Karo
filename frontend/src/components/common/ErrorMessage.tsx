export default function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <div className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <button onClick={onRetry} className="ml-2 rounded border border-red-300 px-2 py-1 text-xs hover:bg-red-100">Retry</button>
        )}
      </div>
    </div>
  );
}
