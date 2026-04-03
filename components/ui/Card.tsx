type CardProps = {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
};

export default function Card({
  children,
  className = "",
  hoverable = false,
}: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl bg-white p-6",
        hoverable &&
          "transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
