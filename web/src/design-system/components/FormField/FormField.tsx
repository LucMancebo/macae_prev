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
  const fieldId = React.useId();
  const classes = [styles.field, className].filter(Boolean).join(" ");
  const child = React.Children.only(children) as React.ReactElement<any>;
  const childId = child.props.id ?? fieldId;
  const control = React.cloneElement(child, {
    id: childId,
    "aria-describedby":
      [
        child.props["aria-describedby"],
        error ? `${childId}-error` : null,
        hint ? `${childId}-hint` : null,
      ]
        .filter(Boolean)
        .join(" ") || undefined,
  });

  return (
    <div className={classes} {...props}>
      {label && (
        <label className={styles.label} htmlFor={childId}>
          {label}
          {required ? <span className={styles.required}>*</span> : null}
        </label>
      )}
      {control}
      {error ? (
        <p
          className={styles.feedbackError}
          id={`${childId}-error`}
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p className={styles.feedbackHint} id={`${childId}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
