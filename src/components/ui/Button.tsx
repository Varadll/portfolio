import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" &&
            "bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md active:scale-[0.98]",
          variant === "secondary" &&
            "bg-secondary text-primary hover:bg-secondary/80 active:scale-[0.98]",
          variant === "outline" &&
            "border-2 border-accent text-accent hover:bg-accent hover:text-white active:scale-[0.98]",
          variant === "ghost" &&
            "text-muted hover:text-primary hover:bg-secondary/60",
          size === "sm" && "h-9 px-4 text-sm gap-1.5",
          size === "md" && "h-11 px-6 text-sm gap-2",
          size === "lg" && "h-12 px-8 text-base gap-2.5",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
export { Button };
