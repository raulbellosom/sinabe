import { Check, ChevronDown } from 'lucide-react';
import { Dropdown } from '../ui/flowbite';

function QRSettingsDropdown({
  label,
  triggerIcon: TriggerIcon,
  triggerLabel,
  options,
  onSelect,
  selectedValue,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs sm:text-sm font-semibold text-(--foreground-muted)">
        {label}
      </label>

      <Dropdown
        dismissOnClick
        className="w-full"
        renderTrigger={() => (
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-(--border) bg-(--surface-muted) px-3 py-2.5 text-left transition-colors hover:border-purple-300 hover:bg-(--surface)"
          >
            <span className="flex min-w-0 items-center gap-2">
              {TriggerIcon ? (
                <TriggerIcon
                  size={16}
                  className="shrink-0 text-purple-600 dark:text-purple-300"
                />
              ) : null}
              <span className="truncate text-sm font-medium text-(--foreground)">
                {triggerLabel}
              </span>
            </span>
            <ChevronDown
              size={16}
              className="shrink-0 text-(--foreground-muted)"
            />
          </button>
        )}
      >
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = option.value === selectedValue;

          return (
            <Dropdown.Item
              key={option.value}
              onClick={() => onSelect(option.value)}
              icon={Icon}
              className="min-h-12"
            >
              <div className="flex w-full items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-(--foreground)">
                    {option.label}
                  </div>
                  {option.description ? (
                    <div className="truncate text-xs text-(--foreground-muted)">
                      {option.description}
                    </div>
                  ) : null}
                </div>
                {isSelected ? (
                  <Check size={14} className="shrink-0 text-purple-600" />
                ) : null}
              </div>
            </Dropdown.Item>
          );
        })}
      </Dropdown>
    </div>
  );
}

export default QRSettingsDropdown;
