/**
 * Unified input class styles for consistent form appearance
 * Use these classes across all form inputs for visual consistency
 */

// Base input classes - consistent height and appearance
export const inputBaseClasses = `
  w-full
  min-h-[42px]
  px-3 py-2.5
  text-sm
  rounded-lg
  border border-[color:var(--border)]
  bg-[color:var(--surface)]
  text-[color:var(--foreground)]
  placeholder:text-[color:var(--foreground-muted)]
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/30 focus:border-[color:var(--primary)]
  disabled:opacity-60 disabled:cursor-not-allowed
`;

// Input with icon padding
export const inputWithIconClasses = `${inputBaseClasses} pl-10`;

// Error state classes
export const inputErrorClasses = `
  border-[color:var(--danger)] 
  focus:ring-[color:var(--danger)]/30 
  focus:border-[color:var(--danger)]
`;

// Label classes
export const labelClasses = `
  block text-sm font-medium 
  text-[color:var(--foreground)] 
  mb-1.5
`;

// Error label classes
export const labelErrorClasses = `text-[color:var(--danger)]`;

// Error message classes
export const errorMessageClasses = `text-[color:var(--danger)] text-xs mt-1`;

// Icon wrapper classes
export const iconWrapperClasses = `
  absolute left-3 top-1/2 -translate-y-1/2
  text-[color:var(--foreground-muted)]
  pointer-events-none
`;

// Helper to combine base with error state
export const getInputClasses = (hasError = false, hasIcon = false) => {
  const base = hasIcon ? inputWithIconClasses : inputBaseClasses;
  return hasError ? `${base} ${inputErrorClasses}` : base;
};

// Dropdown/Select specific styles
export const dropdownClasses = `
  absolute z-50 mt-1 w-full
  max-h-60 overflow-auto
  rounded-lg border border-[color:var(--border)]
  bg-[color:var(--surface)] shadow-lg
  ring-1 ring-black/5
`;

// Dropdown option classes
export const dropdownOptionClasses = `
  px-3 py-2.5 text-sm cursor-pointer
  text-[color:var(--foreground)]
  transition-colors duration-150
  hover:bg-[color:var(--surface-muted)]
`;

// Selected option classes
export const dropdownOptionSelectedClasses = `
  bg-[color:var(--primary)]/10 
  text-[color:var(--primary)]
`;

// Highlighted option classes (keyboard navigation)
export const dropdownOptionHighlightedClasses = `
  bg-[color:var(--surface-muted)]
`;
