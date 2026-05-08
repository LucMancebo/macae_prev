/\*\*

- Template: Componente MACAEPREV + Figma
-
- Regras de Desenvolvimento:
- 1.  Componente em .tsx
- 2.  Estilos em arquivo .css ou .module.css separado
- 3.  SEM CSS inline (style={{}})
- 4.  Props tipadas com interface
- 5.  Respeitar tokens CSS do Design System
-
- Exemplo:
-
- src/app/components/Button/
- ├── Button.tsx
- ├── button.module.css
- └── Button.types.ts
  \*/

// =========================================
// src/app/components/Button/Button.types.ts
// =========================================
export interface ButtonProps
extends React.ButtonHTMLAttributes<HTMLButtonElement> {
variant?: "primary" | "secondary" | "danger";
size?: "sm" | "md" | "lg";
isLoading?: boolean;
children: React.ReactNode;
}

// =========================================
// src/app/components/Button/Button.tsx
// =========================================
import React from "react";
import { ButtonProps } from "./Button.types";
import styles from "./button.module.css";

export const Button: React.FC<ButtonProps> = ({
variant = "primary",
size = "md",
isLoading = false,
disabled,
children,
className,
...props
}) => {
const buttonClass = [
styles.button,
styles[`button--${variant}`],
styles[`button--${size}`],
isLoading && styles["button--loading"],
]
.filter(Boolean)
.join(" ");

return (
<button
className={buttonClass}
disabled={disabled || isLoading}
{...props} >
{isLoading ? "Carregando..." : children}
</button>
);
};

// =========================================
// src/app/components/Button/button.module.css
// =========================================
.button {
display: inline-flex;
align-items: center;
justify-content: center;
font-family: var(--font-family-base);
font-weight: 600;
border-radius: var(--radius-md);
border: none;
cursor: pointer;
transition: all var(--transition-base);
}

.button--primary {
background-color: var(--color-primary);
color: white;
}

.button--primary:hover:not(:disabled) {
background-color: var(--color-primary-hover);
}

.button--secondary {
background-color: transparent;
color: var(--text-primary);
border: 1px solid var(--border-default);
}

.button--secondary:hover:not(:disabled) {
background-color: var(--bg-card-hover);
border-color: var(--border-hover);
}

.button--danger {
background-color: var(--color-danger);
color: white;
}

.button--danger:hover:not(:disabled) {
background-color: var(--color-danger);
opacity: 0.9;
}

.button--md {
padding: var(--spacing-md) var(--spacing-lg);
font-size: var(--font-size-body);
}

.button--sm {
padding: var(--spacing-sm) var(--spacing-md);
font-size: var(--font-size-small);
}

.button--lg {
padding: var(--spacing-lg) var(--spacing-xl);
font-size: var(--font-size-h3);
}

.button:disabled {
opacity: 0.5;
cursor: not-allowed;
}

.button--loading {
pointer-events: none;
}
