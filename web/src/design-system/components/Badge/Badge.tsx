import React from "react";
import styles from "./badge.module.css";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "success" | "danger" | "neutral" | "warning";
}

export function Badge({
  className,
  tone = "neutral",
  children,
  ...props
}: BadgeProps) {
  const classes = [styles.badge, styles[`badge--${tone}`], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
