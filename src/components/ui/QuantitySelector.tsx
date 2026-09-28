'use client';

interface QuantitySelectorProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  className = '',
}: QuantitySelectorProps) {
  const canDecrement = value > min;
  const canIncrement = max === undefined || value < max;

  function handleDecrement() {
    if (canDecrement) onChange(value - 1);
  }

  function handleIncrement() {
    if (canIncrement) onChange(value + 1);
  }

  return (
    <div
      className={`inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white ${className}`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        aria-label="Decrease quantity"
        className={[
          'flex items-center justify-center w-9 h-9 text-slate-600 transition-colors duration-150',
          'hover:bg-slate-50 active:bg-slate-100',
          !canDecrement ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </button>

      <span className="w-10 text-center text-sm font-semibold text-slate-900 select-none tabular-nums">
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        aria-label="Increase quantity"
        className={[
          'flex items-center justify-center w-9 h-9 text-slate-600 transition-colors duration-150',
          'hover:bg-slate-50 active:bg-slate-100',
          !canIncrement ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
