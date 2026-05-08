import React from "react";
import styles from "./form-field.module.css";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export function FormField({
  className,
  label,
  hint,
  error,
  required,
  children,
  ...props
}: FormFieldProps) {
  const classes = [styles.field, className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...props}>
      {label && (
        <label className={styles.label}>
          {label}
          {required ? <span className={styles.required}>*</span> : null}
        </label>
      )}
      {children}
      {error ? (
        <p className={styles.feedbackError}>{error}</p>
      ) : hint ? (
        <p className={styles.feedbackHint}>{hint}</p>
      ) : null}
    </div>
  );
}
