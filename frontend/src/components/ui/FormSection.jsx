import cn from './cn';

/**
 * FormSection - Modern section divider for forms
 * Uses CSS variables for theme consistency
 */
const FormSection = ({
  title,
  description,
  icon: Icon,
  children,
  className,
  variant = 'default', // 'default' | 'card' | 'minimal'
}) => {
  const variants = {
    default: 'border-b border-[color:var(--border)] pb-4 mb-6',
    card: 'rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 md:p-5 shadow-sm',
    minimal: 'mb-4',
  };

  return (
    <section className={cn(variants[variant], className)}>
      {(title || description) && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--primary)]/10">
                <Icon className="h-4 w-4 text-[color:var(--primary)]" />
              </div>
            )}
            {title && (
              <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                {title}
              </h3>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

export default FormSection;
