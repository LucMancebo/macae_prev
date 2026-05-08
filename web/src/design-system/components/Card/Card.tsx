import React from "react";
import styles from "./card.module.css";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ className, elevated = true, ...props }: CardProps) {
  const classes = [styles.card, elevated && styles["card--elevated"], className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}
