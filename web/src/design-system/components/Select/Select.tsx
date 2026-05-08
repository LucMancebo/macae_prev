import React from "react";
import styles from "../Input/input.module.css";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  compact?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, compact = false, children, ...props }, ref) {
    const classes = [
      styles.input,
      compact && styles["input--compact"],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <select ref={ref} className={classes} {...props}>
        {children}
      </select>
    );
  },
);
