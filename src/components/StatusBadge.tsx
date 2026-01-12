
type Status = 'queued' | 'processing' | 'completed' | 'failed';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  queued: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  processing: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  completed: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20',
  failed: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
};

const labels: Record<Status, string> = {
  queued: 'Queued',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-gray-500/15 text-gray-600';
  const label = labels[status] || status;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${style} ${className}`}
    >
      {status === 'processing' && (
        <svg
          className="mr-1.5 h-3 w-3 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
      )}
      {status === 'queued' && (
         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-3 w-3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      )}
      {label}
    </span>
  );
}
