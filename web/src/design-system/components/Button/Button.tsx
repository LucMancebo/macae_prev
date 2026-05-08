import React from "react";
import styles from "./button.module.css";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  iconOnly?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      children,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      iconOnly = false,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) {
    const classes = [
      styles.button,
      styles[`button--${variant}`],
      styles[`button--${size}`],
      fullWidth && styles["button--fullWidth"],
      iconOnly && styles["button--iconOnly"],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={classes}
        type={type}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? "Carregando..." : children}
      </button>
    );
  },
);
