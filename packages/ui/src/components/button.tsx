import { cn } from "@repo/shared/utils";
import Link from "next/link";
import { forwardRef } from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  variant?:
    | "primary"
    | "secondary"
    | "error"
    | "icon"
    | "text"
    | "text-error"
    | "outline";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  href?: string;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      onClick,
      className,
      variant = "primary",
      disabled = false,
      icon,
      iconPosition = "left",
      href,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const Component = href ? Link : "button";
    return (
      <Component
        // @ts-expect-error - ref is not typed
        ref={ref}
        // @ts-expect-error - href is not typed
        href={href}
        onClick={onClick}
        className={cn(
          "flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 px-4 py-2 text-sm font-bold outline-none",
          variant === "primary" && "bg-slate-900 text-white",
          variant === "secondary" && "",
          variant === "error" && "bg-red-400 text-white",
          variant === "icon" &&
            "min-h-auto rounded-full bg-transparent p-2 text-slate-900 transition-colors duration-200 hover:bg-gray-400/10 data-[disabled=true]:hover:bg-transparent",
          variant === "text" &&
            "min-h-auto bg-transparent p-0 text-slate-900 transition-colors duration-200 hover:text-slate-900/70 data-[disabled=true]:hover:text-slate-900",
          variant === "text-error" &&
            "min-h-auto bg-transparent p-0 text-red-500 transition-colors duration-200 hover:text-red-500/70 data-[disabled=true]:hover:text-red-500",
          variant === "outline" &&
            "border border-gray-400/20 bg-transparent text-slate-400 transition-colors duration-200 hover:border-slate-900 data-[disabled=true]:hover:border-gray-400/20",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        disabled={disabled}
        data-disabled={disabled}
        type={type}
        {...props}
      >
        {icon && iconPosition === "left" && icon}
        {children}
        {icon && iconPosition === "right" && icon}
      </Component>
    );
  },
);

Button.displayName = "Button";

export default Button;
