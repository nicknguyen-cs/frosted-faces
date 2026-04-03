import { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import Link from "next/link";

const variants = {
  primary:
    "bg-terracotta text-white hover:bg-terracotta-dark active:bg-terracotta-dark",
  secondary:
    "border border-sand-200 text-charcoal hover:bg-sand-100 active:bg-sand-200",
  ghost: "text-stone hover:bg-sand-100 active:bg-sand-200",
} as const;

const sizes = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

type ButtonAsButton = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: false;
  href?: never;
};

type ButtonAsLink = AnchorHTMLAttributes<HTMLAnchorElement> & {
  asChild: true;
  href: string;
};

type ButtonProps = (ButtonAsButton | ButtonAsLink) & {
  variant?: Variant;
  size?: Size;
};

export default function Button({
  variant = "primary",
  size = "md",
  asChild,
  className = "",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center rounded-full font-body font-medium",
    "transition-colors duration-150 cursor-pointer",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta",
    "disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  ].join(" ");

  if (asChild) {
    const { href, ...rest } = props as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...rest} />
    );
  }

  return <button className={classes} {...(props as ButtonAsButton)} />;
}
