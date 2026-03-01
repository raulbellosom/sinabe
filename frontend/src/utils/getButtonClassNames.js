import classNames from 'classnames';

export const getButtonClassNames = (
  color,
  filled,
  disabled = false,
  className,
) => {
  const baseClasses =
    'w-fit text-xs xl:text-sm transition ease-in-out duration-200 px-3 py-2 flex items-center justify-center rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-offset-1';

  // Semantic colors using CSS variables
  const semanticColors = {
    primary: {
      filled:
        'bg-[color:var(--primary)] text-[color:var(--primary-foreground)] border-[color:var(--primary)] hover:opacity-90',
      outline:
        'text-[color:var(--primary)] border-[color:var(--primary)] hover:bg-[color:var(--primary)] hover:text-[color:var(--primary-foreground)]',
    },
    danger: {
      filled:
        'bg-[color:var(--danger)] text-[color:var(--danger-foreground)] border-[color:var(--danger)] hover:opacity-90',
      outline:
        'text-[color:var(--danger)] border-[color:var(--danger)] hover:bg-[color:var(--danger)] hover:text-[color:var(--danger-foreground)]',
    },
    warning: {
      filled:
        'bg-[color:var(--warning)] text-[color:var(--warning-foreground)] border-[color:var(--warning)] hover:opacity-90',
      outline:
        'text-[color:var(--warning)] border-[color:var(--warning)] hover:bg-[color:var(--warning)] hover:text-[color:var(--warning-foreground)]',
    },
    success: {
      filled:
        'bg-[color:var(--success)] text-[color:var(--success-foreground)] border-[color:var(--success)] hover:opacity-90',
      outline:
        'text-[color:var(--success)] border-[color:var(--success)] hover:bg-[color:var(--success)] hover:text-[color:var(--success-foreground)]',
    },
    info: {
      filled:
        'bg-[color:var(--info)] text-[color:var(--info-foreground)] border-[color:var(--info)] hover:opacity-90',
      outline:
        'text-[color:var(--info)] border-[color:var(--info)] hover:bg-[color:var(--info)] hover:text-[color:var(--info-foreground)]',
    },
  };

  // Map old color names to semantic colors
  const colorMap = {
    purple: 'primary',
    red: 'danger',
    failure: 'danger',
    amber: 'warning',
    emerald: 'success',
    green: 'success',
    blue: 'info',
    cyan: 'info',
  };

  // Fallback colors for non-semantic colors (using Tailwind defaults)
  const fallbackColors = {
    dark: {
      filled: 'bg-slate-700 text-white border-slate-700 hover:bg-slate-800',
      outline:
        'text-slate-600 border-slate-600 hover:bg-slate-700 hover:text-white dark:text-slate-300 dark:border-slate-400',
    },
    gray: {
      filled:
        'bg-[color:var(--surface-muted)] text-[color:var(--foreground)] border-[color:var(--border)] hover:bg-[color:var(--border)]',
      outline:
        'text-[color:var(--foreground-muted)] border-[color:var(--border)] hover:bg-[color:var(--surface-muted)]',
    },
    stone: {
      filled:
        'bg-[color:var(--surface-muted)] text-[color:var(--foreground)] border-[color:var(--border)] hover:bg-[color:var(--border)]',
      outline:
        'text-[color:var(--foreground-muted)] border-[color:var(--border)] hover:bg-[color:var(--surface-muted)]',
    },
    indigo: {
      filled: 'bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600',
      outline:
        'text-indigo-500 border-indigo-500 hover:bg-indigo-500 hover:text-white',
    },
    yellow: {
      filled: 'bg-amber-400 text-amber-950 border-amber-400 hover:bg-amber-500',
      outline:
        'text-amber-500 border-amber-500 hover:bg-amber-500 hover:text-white',
    },
    pink: {
      filled: 'bg-pink-500 text-white border-pink-500 hover:bg-pink-600',
      outline:
        'text-pink-500 border-pink-500 hover:bg-pink-500 hover:text-white',
    },
    teal: {
      filled: 'bg-teal-500 text-white border-teal-500 hover:bg-teal-600',
      outline:
        'text-teal-500 border-teal-500 hover:bg-teal-500 hover:text-white',
    },
    lime: {
      filled: 'bg-lime-500 text-white border-lime-500 hover:bg-lime-600',
      outline:
        'text-lime-500 border-lime-500 hover:bg-lime-500 hover:text-white',
    },
    violet: {
      filled: 'bg-violet-500 text-white border-violet-500 hover:bg-violet-600',
      outline:
        'text-violet-500 border-violet-500 hover:bg-violet-500 hover:text-white',
    },
    rose: {
      filled: 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600',
      outline:
        'text-rose-500 border-rose-500 hover:bg-rose-500 hover:text-white',
    },
    fuchsia: {
      filled:
        'bg-fuchsia-500 text-white border-fuchsia-500 hover:bg-fuchsia-600',
      outline:
        'text-fuchsia-500 border-fuchsia-500 hover:bg-fuchsia-500 hover:text-white',
    },
    white: {
      filled: 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50',
      outline: 'text-gray-900 border-gray-200 hover:bg-white',
    },
    black: {
      filled: 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800',
      outline:
        'text-gray-900 border-gray-900 hover:bg-gray-900 hover:text-white dark:text-white dark:border-gray-400',
    },
  };

  // Resolve semantic color
  const resolvedColor = colorMap[color] || color;
  const colorStyles =
    semanticColors[resolvedColor] ||
    fallbackColors[color] ||
    fallbackColors.gray;

  const colorClasses = filled ? colorStyles.filled : colorStyles.outline;

  const disabledClasses = disabled
    ? 'cursor-not-allowed opacity-50 hover:opacity-50'
    : '';

  return classNames(baseClasses, colorClasses, disabledClasses, className);
};
