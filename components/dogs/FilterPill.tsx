"use client";

interface FilterPillProps {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function FilterPill({ label, active, disabled, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-4 py-2 text-sm transition ${
        disabled
          ? "bg-sand-200/50 text-pebble/40 cursor-not-allowed"
          : active
            ? "bg-charcoal text-white cursor-pointer"
            : "bg-sand-200 text-stone hover:bg-sand-100 cursor-pointer"
      }`}
    >
      {label}
    </button>
  );
}
