export default function LoadingSpinner({ size = 24, overlay = false }: { size?: number; overlay?: boolean }) {
  const spinner = (
    <svg className="animate-spin text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={size} height={size}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );
  if (!overlay) return spinner;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="rounded-md bg-white p-4 shadow">{spinner}</div>
    </div>
  );
}
