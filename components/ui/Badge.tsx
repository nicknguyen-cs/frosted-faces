type TraitBadge = {
  variant: "trait";
};

type StatusBadge = {
  variant: "status";
  status: "available" | "pending" | "adopted";
};

type FilterBadge = {
  variant: "filter";
  active?: boolean;
};

type BadgeProps = (TraitBadge | StatusBadge | FilterBadge) & {
  children: React.ReactNode;
  className?: string;
};

const statusColors = {
  available: "bg-sage text-white",
  pending: "bg-amber text-white",
  adopted: "bg-terracotta text-white",
} as const;

export default function Badge(props: BadgeProps) {
  const { variant, children, className = "" } = props;

  let colorClasses: string;

  switch (variant) {
    case "trait":
      colorClasses = "bg-sage text-white";
      break;
    case "status":
      colorClasses = statusColors[(props as StatusBadge).status];
      break;
    case "filter": {
      const active = (props as FilterBadge).active;
      colorClasses = active
        ? "bg-charcoal text-white"
        : "bg-sand-200 text-stone";
      break;
    }
  }

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium font-body",
        colorClasses,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
