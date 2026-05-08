import React from "react";
import styles from "./input.module.css";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  compact?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, compact = false, ...props }, ref) {
    const classes = [
      styles.input,
      compact && styles["input--compact"],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <input ref={ref} className={classes} {...props} />;
  },
);
