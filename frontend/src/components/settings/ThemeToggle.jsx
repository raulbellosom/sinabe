import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../providers/theme/useTheme';

const options = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
];

const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1 ${className}`}>
      <div className="grid grid-cols-3 gap-1">
        {options.map((option) => {
          const Icon = option.icon;
          const selected = theme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={[
                'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                selected
                  ? 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                  : 'text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]',
              ].join(' ')}
            >
              <Icon size={16} />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeToggle;
