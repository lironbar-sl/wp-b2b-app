import { Button } from './Button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}: ErrorMessageProps) {
  return (
    <div
      className={`flex flex-col gap-3 bg-red-50 border border-red-200 rounded-xl p-5 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-0.5 text-red-500">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-red-700">{title}</p>
          <p className="text-sm text-red-600 leading-relaxed">{message}</p>
        </div>
      </div>
      {onRetry && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
