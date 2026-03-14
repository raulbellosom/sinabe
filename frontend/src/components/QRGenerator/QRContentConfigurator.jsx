import {
  QR_CONTENT_PRESETS,
  QR_MINIMAL_FIELD_OPTIONS,
  describeQRContent,
  normalizeQRContentOptions,
  resolveQRFieldKeys,
} from '../../utils/qrCodeUtils';
import { Link, List, Settings2, ShieldCheck } from 'lucide-react';
import QRSettingsDropdown from './QRSettingsDropdown';

const PRESET_ORDER = [
  QR_CONTENT_PRESETS.compact.key,
  QR_CONTENT_PRESETS.full.key,
  QR_CONTENT_PRESETS.url.key,
  QR_CONTENT_PRESETS.sn.key,
  QR_CONTENT_PRESETS.custom.key,
];

const PRESET_ICON_MAP = {
  [QR_CONTENT_PRESETS.compact.key]: ShieldCheck,
  [QR_CONTENT_PRESETS.full.key]: List,
  [QR_CONTENT_PRESETS.url.key]: Link,
  [QR_CONTENT_PRESETS.sn.key]: ShieldCheck,
  [QR_CONTENT_PRESETS.custom.key]: Settings2,
};

function QRContentConfigurator({ value, onChange }) {
  const normalizedValue = normalizeQRContentOptions(value);
  const selectedFieldKeys = resolveQRFieldKeys(normalizedValue);
  const minimalSelection = QR_MINIMAL_FIELD_OPTIONS.map(
    (field) => field.key,
  ).filter((fieldKey) => selectedFieldKeys.includes(fieldKey));

  const handlePresetChange = (preset) => {
    onChange({
      ...normalizedValue,
      preset,
    });
  };

  const handleToggleField = (fieldKey) => {
    const nextFieldKeys = minimalSelection.includes(fieldKey)
      ? minimalSelection.filter(
          (selectedFieldKey) => selectedFieldKey !== fieldKey,
        )
      : [...minimalSelection, fieldKey];

    onChange({
      preset: QR_CONTENT_PRESETS.custom.key,
      customFieldKeys: nextFieldKeys.length > 0 ? nextFieldKeys : ['url'],
    });
  };

  const showCustomFieldSelection =
    normalizedValue.preset === QR_CONTENT_PRESETS.custom.key;
  const presetOptions = PRESET_ORDER.map((presetKey) => ({
    value: presetKey,
    label: QR_CONTENT_PRESETS[presetKey].label,
    icon: PRESET_ICON_MAP[presetKey],
  }));
  const selectedPreset = presetOptions.find(
    (option) => option.value === normalizedValue.preset,
  );

  return (
    <div className="grid gap-3 rounded-xl border border-(--border) bg-(--surface-muted) p-4">
      <QRSettingsDropdown
        label="Contenido del QR"
        triggerIcon={selectedPreset?.icon}
        triggerLabel={selectedPreset?.label || QR_CONTENT_PRESETS.compact.label}
        options={presetOptions}
        selectedValue={normalizedValue.preset}
        onSelect={handlePresetChange}
      />

      {showCustomFieldSelection && (
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--foreground-muted)">
            Campos personalizados
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {QR_MINIMAL_FIELD_OPTIONS.map((field) => {
              const isChecked = minimalSelection.includes(field.key);

              return (
                <label
                  key={field.key}
                  className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--foreground)"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleField(field.key)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>{field.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-(--foreground-muted)">
          Codificando:{' '}
          <span className="font-mono text-(--foreground)">
            {describeQRContent(normalizedValue)}
          </span>
        </p>
      </div>
    </div>
  );
}

export default QRContentConfigurator;
