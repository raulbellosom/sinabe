
const AccountFields = ({
  id,
  label,
  name,
  value,
  onChange,
  allowEdit,
  isEditing,
  inputType = 'text',
  icon: Icon,
}) => {
  const isEditMode = allowEdit && isEditing;

  return (
    <div className="group flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wider text-(--foreground-muted)"
      >
        {label}
      </label>
      {isEditMode ? (
        <div className="relative">
          {Icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
              <Icon size={15} />
            </span>
          )}
          <input
            id={id}
            name={name}
            value={value || ''}
            onChange={onChange}
            type={inputType}
            className={`w-full rounded-xl border border-(--border) bg-(--surface) py-2.5 text-sm text-(--foreground) transition-all duration-150 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 ${Icon ? 'pl-9 pr-4' : 'px-4'}`}
          />
        </div>
      ) : (
        <p className="rounded-xl border border-transparent bg-(--surface-muted) px-4 py-2.5 text-sm font-medium text-(--foreground)">
          {value || <span className="italic text-(--foreground-muted)">—</span>}
        </p>
      )}
    </div>
  );
};

export default AccountFields;
