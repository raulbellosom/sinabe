import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
} from 'lucide-react';

import {
  Button as UIButton,
  Input,
  Textarea as UITextarea,
  Select as UISelect,
  Badge as UIBadge,
  Card as UICard,
  Pagination as UIPagination,
} from './index';
import cn from './cn';

const sizeMap = {
  xs: 'text-xs px-2 py-1.5',
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-5 py-3',
  xl: 'text-lg px-6 py-3',
};

const modalSizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-[95vw]',
};

const colorToVariant = {
  info: 'primary',
  blue: 'primary',
  cyan: 'primary',
  success: 'secondary',
  green: 'secondary',
  gray: 'secondary',
  light: 'ghost',
  warning: 'secondary',
  failure: 'danger',
  red: 'danger',
  purple: 'primary',
};

export const Button = ({
  color,
  size = 'md',
  className,
  gradientDuoTone,
  isProcessing = false,
  disabled = false,
  pill = false,
  outline = false,
  children,
  ...props
}) => {
  const variant = colorToVariant[color] || 'primary';
  const buttonVariant = outline
    ? 'ghost'
    : gradientDuoTone
      ? 'primary'
      : variant;

  return (
    <UIButton
      variant={buttonVariant}
      disabled={disabled || isProcessing}
      className={cn(sizeMap[size], pill && 'rounded-full', className)}
      {...props}
    >
      {isProcessing ? <Spinner size="sm" className="me-2" /> : null}
      {children}
    </UIButton>
  );
};

export const TextInput = ({ color, className, ...props }) => {
  const hasError = color === 'failure';

  return (
    <Input
      className={cn(hasError && 'border-[color:var(--danger)]', className)}
      {...props}
    />
  );
};

export const Textarea = ({ color, className, ...props }) => {
  const hasError = color === 'failure';

  return (
    <UITextarea
      className={cn(hasError && 'border-[color:var(--danger)]', className)}
      {...props}
    />
  );
};

export const Select = ({
  color,
  className,
  icon: _icon,
  helperText: _helperText,
  addon: _addon,
  shadow: _shadow,
  sizing: _sizing,
  ...props
}) => {
  const hasError = color === 'failure';

  return (
    <UISelect
      className={cn(hasError && 'border-[color:var(--danger)]', className)}
      {...props}
    />
  );
};

export const Label = ({
  htmlFor,
  value,
  children,
  className,
  color,
  ...props
}) => (
  <label
    htmlFor={htmlFor}
    className={cn(
      'mb-1 block text-sm font-medium',
      color === 'failure'
        ? 'text-[color:var(--danger)]'
        : 'text-[color:var(--foreground)]',
      className,
    )}
    {...props}
  >
    {value || children}
  </label>
);

export const FileInput = ({ className, ...props }) => (
  <input
    type="file"
    className={cn(
      'block w-full cursor-pointer rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] text-sm file:mr-3 file:border-0 file:bg-[color:var(--surface-muted)] file:px-3 file:py-2 file:text-sm',
      className,
    )}
    {...props}
  />
);

export const Checkbox = ({ className, ...props }) => (
  <input
    type="checkbox"
    className={cn(
      'sinabe-checkbox h-4 w-4 cursor-pointer appearance-none rounded-[3px] transition-all duration-150',
      'border-2 border-[color:var(--border)] bg-[color:var(--surface)]',
      'checked:border-[color:var(--primary)] checked:bg-[color:var(--primary)]',
      'focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:ring-offset-1',
      className,
    )}
    {...props}
  />
);

export const Spinner = ({ size = 'md', className }) => {
  const sizeClass =
    size === 'xs'
      ? 'h-3 w-3 border'
      : size === 'sm'
        ? 'h-4 w-4 border-2'
        : size === 'lg'
          ? 'h-8 w-8 border-[3px]'
          : size === 'xl'
            ? 'h-10 w-10 border-4'
            : 'h-6 w-6 border-[3px]';

  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-solid border-[color:var(--primary)] border-r-transparent',
        sizeClass,
        className,
      )}
      aria-label="Cargando"
    />
  );
};

export const Badge = ({
  color = 'gray',
  icon: Icon,
  className,
  children,
  ...props
}) => {
  const normalizedColor =
    color === 'failure'
      ? 'danger'
      : color === 'info' ||
          color === 'blue' ||
          color === 'cyan' ||
          color === 'purple'
        ? 'primary'
        : color === 'green'
          ? 'success'
          : color;

  return (
    <UIBadge color={normalizedColor} className={className} {...props}>
      {Icon ? <Icon size={12} /> : null}
      {children}
    </UIBadge>
  );
};

export const Card = ({ className, children, ...props }) => (
  <UICard className={className} {...props}>
    {children}
  </UICard>
);

const alertColorClass = {
  success:
    'border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]',
  warning:
    'border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 text-[color:var(--warning)]',
  failure:
    'border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10 text-[color:var(--danger)]',
  info: 'border-[color:var(--primary)]/40 bg-[color:var(--primary)]/10 text-[color:var(--primary)]',
};

export const Alert = ({
  color = 'info',
  icon: Icon = CircleAlert,
  className,
  children,
}) => (
  <div
    className={cn(
      'flex items-start gap-2 rounded-xl border px-3 py-2 text-sm',
      alertColorClass[color] || alertColorClass.info,
      className,
    )}
  >
    <Icon className="mt-0.5 h-4 w-4" />
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);

export const Progress = ({
  progress = 0,
  color = 'blue',
  className,
  progressLabelPosition,
  progressLabel,
}) => {
  const barColor =
    color === 'green'
      ? 'bg-[color:var(--success)]'
      : color === 'red' || color === 'failure'
        ? 'bg-[color:var(--danger)]'
        : color === 'yellow' || color === 'warning'
          ? 'bg-[color:var(--warning)]'
          : 'bg-[color:var(--primary)]';

  return (
    <div className={cn('w-full', className)}>
      {(progressLabelPosition || progressLabel) && (
        <p className="mb-1 text-xs text-[color:var(--foreground-muted)]">
          {progressLabel || `${Math.round(progress)}%`}
        </p>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
        <div
          className={cn('h-full transition-all', barColor)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const Tooltip = ({ content, children, className }) => (
  <span className={cn('group relative inline-flex', className)}>
    {children}
    <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 rounded-md bg-black px-2 py-1 text-xs text-white group-hover:block group-focus-within:block">
      {content}
    </span>
  </span>
);

export const ToggleSwitch = ({
  checked = false,
  onChange,
  label,
  disabled,
}) => (
  <label className="inline-flex items-center gap-2">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50',
        checked
          ? 'bg-[color:var(--primary)]'
          : 'bg-[color:var(--surface-muted)]',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-5' : 'translate-x-1',
        )}
      />
    </button>
    {label ? <span className="text-sm">{label}</span> : null}
  </label>
);

const DropdownContext = createContext({
  dismissOnClick: true,
  close: () => {},
});

export const Dropdown = ({
  label = 'Opciones',
  children,
  className,
  inline = false,
  dismissOnClick = true,
  renderTrigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const close = () => setIsOpen(false);
  const context = useMemo(() => ({ dismissOnClick, close }), [dismissOnClick]);

  return (
    <DropdownContext.Provider value={context}>
      <div
        ref={ref}
        className={cn('relative inline-block text-left', className)}
      >
        {renderTrigger ? (
          <div onClick={() => setIsOpen((o) => !o)}>{renderTrigger()}</div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className={cn(
              inline
                ? 'inline-flex items-center gap-1 text-sm text-[color:var(--foreground)]'
                : 'inline-flex items-center gap-1 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm font-medium',
            )}
          >
            {label}
            <ChevronDown size={16} />
          </button>
        )}
        {isOpen && (
          <div className="absolute right-0 z-40 mt-2 w-56 origin-top-right rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1 shadow-xl">
            {children}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
};

const DropdownItem = ({
  children,
  onClick,
  icon: Icon,
  className,
  href,
  as,
  ...props
}) => {
  const { dismissOnClick, close } = useContext(DropdownContext);
  const Component = as || (href ? 'a' : 'button');

  return (
    <Component
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (dismissOnClick) close();
      }}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[color:var(--surface-muted)]',
        className,
      )}
      {...props}
    >
      {Icon ? <Icon size={14} /> : null}
      {children}
    </Component>
  );
};

const DropdownDivider = ({ className }) => (
  <div
    className={cn('my-1 border-t border-[color:var(--border)]', className)}
  />
);

Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;

export const Modal = ({
  show = false,
  onClose = () => {},
  size = '2xl',
  children,
  className,
}) => {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (show) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, onClose]);

  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/45" onClick={onClose} />
      <div
        className={cn(
          'relative max-h-[90vh] w-full overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-2xl',
          modalSizeMap[size] || modalSizeMap['2xl'],
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

Modal.Header = ({ className, children }) => (
  <div
    className={cn(
      'border-b border-[color:var(--border)] px-5 py-4 text-lg font-semibold',
      className,
    )}
  >
    {children}
  </div>
);

Modal.Body = ({ className, children }) => (
  <div className={cn('max-h-[68vh] overflow-y-auto px-5 py-4', className)}>
    {children}
  </div>
);

Modal.Footer = ({ className, children }) => (
  <div
    className={cn('border-t border-[color:var(--border)] px-5 py-4', className)}
  >
    {children}
  </div>
);

export const Table = ({ className, striped, hoverable, children }) => (
  <div className="overflow-x-auto">
    <table
      className={cn(
        'min-w-full border-collapse text-sm',
        striped &&
          '[&>tbody>tr:nth-child(odd)]:bg-[color:var(--surface-muted)]/40',
        hoverable && '[&>tbody>tr:hover]:bg-[color:var(--surface-muted)]',
        className,
      )}
    >
      {children}
    </table>
  </div>
);

Table.Head = ({ className, children }) => (
  <thead
    className={cn(
      'bg-[color:var(--surface-muted)] text-[color:var(--foreground-muted)]',
      className,
    )}
  >
    <tr>{children}</tr>
  </thead>
);

Table.HeadCell = ({ className, children, ...props }) => (
  <th
    className={cn(
      'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide',
      className,
    )}
    {...props}
  >
    {children}
  </th>
);

Table.Body = ({ className, children }) => (
  <tbody className={className}>{children}</tbody>
);

Table.Row = ({ className, children, ...props }) => (
  <tr
    className={cn('border-t border-[color:var(--border)]', className)}
    {...props}
  >
    {children}
  </tr>
);

Table.Cell = ({ className, children, ...props }) => (
  <td className={cn('px-3 py-2 align-top', className)} {...props}>
    {children}
  </td>
);

const TabsItem = ({ children }) => children;

export const Tabs = forwardRef(
  ({ children, onActiveTabChange, className }, ref) => {
    const items = React.Children.toArray(children).filter(Boolean);
    const [active, setActive] = useState(0);

    const setActiveIndex = (index) => {
      setActive(index);
      onActiveTabChange?.(index);
    };

    useImperativeHandle(ref, () => ({
      setActiveTab: (index) => setActiveIndex(index),
    }));

    return (
      <div className={className}>
        <div className="mb-3 flex flex-wrap gap-2 border-b border-[color:var(--border)] pb-2">
          {items.map((item, index) => {
            const Icon = item.props.icon;
            const isActive = active === index;
            return (
              <button
                key={item.key || index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm',
                  isActive
                    ? 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                    : 'hover:bg-[color:var(--surface-muted)]',
                )}
              >
                {Icon ? <Icon size={14} /> : null}
                {item.props.title || `Tab ${index + 1}`}
              </button>
            );
          })}
        </div>
        <div>{items[active]}</div>
      </div>
    );
  },
);

Tabs.displayName = 'Tabs';

Tabs.Item = TabsItem;

export const Timeline = ({ className, children }) => (
  <ol
    className={cn(
      'relative border-s border-[color:var(--border)] ps-4',
      className,
    )}
  >
    {children}
  </ol>
);

Timeline.Item = ({ className, children }) => (
  <li className={cn('relative mb-6', className)}>{children}</li>
);

Timeline.Point = ({ icon: Icon = CircleAlert }) => (
  <span className="absolute -start-[1.2rem] mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)]">
    <Icon size={12} />
  </span>
);

Timeline.Content = ({ className, children }) => (
  <div className={className}>{children}</div>
);

Timeline.Time = ({ className, children }) => (
  <p className={cn('text-xs text-[color:var(--foreground-muted)]', className)}>
    {children}
  </p>
);

Timeline.Title = ({ className, children }) => (
  <h4 className={cn('text-sm font-semibold', className)}>{children}</h4>
);

Timeline.Body = ({ className, children }) => (
  <div
    className={cn('text-sm text-[color:var(--foreground-muted)]', className)}
  >
    {children}
  </div>
);

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showIcons,
  className,
}) => {
  if (showIcons) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="ghost"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="text-sm">
          {currentPage}/{totalPages}
        </span>
        <Button
          variant="ghost"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    );
  }

  return (
    <UIPagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      className={className}
    />
  );
};

export const Breadcrumb = ({ children, className }) => (
  <nav className={cn('text-sm', className)}>{children}</nav>
);

Breadcrumb.Item = ({ href, className, children }) => {
  const Component = href ? 'a' : 'span';
  return (
    <Component
      href={href}
      className={cn(
        'text-[color:var(--foreground-muted)] hover:underline',
        className,
      )}
    >
      {children}
    </Component>
  );
};

export default {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Dropdown,
  FileInput,
  Label,
  Modal,
  Pagination,
  Progress,
  Select,
  Spinner,
  Table,
  Tabs,
  TextInput,
  Textarea,
  Timeline,
  ToggleSwitch,
  Tooltip,
};
