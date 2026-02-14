# UI Style Guide
## AI Board Game Agent System

**Version:** 1.0
**Date:** February 13, 2026

---

## Overview

This document defines the visual design and style standards for the AI Board Game Agent system web UI.

**⚠️ Note:** The web UI is a **future implementation phase**. Current focus is on the **CLI interface**. This style guide will be applied when web UI development begins.

---

## Design Principles

### Clarity
- Make the interface intuitive and easy to understand
- Use clear labels and descriptions
- Provide visual hierarchy
- Avoid clutter

### Consistency
- Use consistent patterns throughout the app
- Maintain consistent spacing, colors, and typography
- Follow established conventions
- Make similar things look similar

### Feedback
- Provide immediate feedback for user actions
- Show loading states for async operations
- Confirm destructive actions
- Display clear error messages

### Efficiency
- Minimize clicks to complete tasks
- Provide keyboard shortcuts
- Remember user preferences
- Use smart defaults

---

## Color Palette

**All colors use CSS variables for easy theming.**

### Primary Colors

```css
/* Primary - Used for main actions and interactive elements */
--color-primary: #2563eb;          /* Blue 600 */
--color-primary-hover: #1d4ed8;    /* Blue 700 */
--color-primary-active: #1e40af;   /* Blue 800 */

/* Secondary - Used for less prominent actions */
--color-secondary: #64748b;        /* Slate 500 */
--color-secondary-hover: #475569;  /* Slate 600 */
```

**Note:** These base colors can be overridden for different themes (light/dark mode).

### Semantic Colors

```css
/* Success */
--color-success: #16a34a;          /* Green 600 */
--color-success-light: #dcfce7;    /* Green 100 */
--color-success-dark: #15803d;     /* Green 700 */

/* Error */
--color-error: #dc2626;            /* Red 600 */
--color-error-light: #fee2e2;      /* Red 100 */
--color-error-dark: #b91c1c;       /* Red 700 */

/* Warning */
--color-warning: #f59e0b;          /* Amber 500 */
--color-warning-light: #fef3c7;    /* Amber 100 */
--color-warning-dark: #d97706;     /* Amber 600 */

/* Info */
--color-info: #3b82f6;             /* Blue 500 */
--color-info-light: #dbeafe;       /* Blue 100 */
--color-info-dark: #2563eb;        /* Blue 600 */
```

### Neutral Colors

```css
/* Backgrounds and borders */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
```

### Text Colors

```css
--color-text-primary: var(--color-gray-900);
--color-text-secondary: var(--color-gray-600);
--color-text-disabled: var(--color-gray-400);
--color-text-inverse: #ffffff;
```

### Background Colors

```css
--color-bg-primary: #ffffff;
--color-bg-secondary: var(--color-gray-50);
--color-bg-tertiary: var(--color-gray-100);
--color-bg-dark: var(--color-gray-900);
```

---

## Typography

### Font Families

```css
/* Primary font - UI text */
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
  'Roboto', 'Helvetica Neue', Arial, sans-serif;

/* Monospace - Code and data */
--font-family-mono: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
```

### Font Sizes

```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
```

### Font Weights

```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Line Heights

```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Usage

```css
/* Headings */
h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
}

h2 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

h3 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}

/* Body text */
body {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
}

/* Small text */
.text-small {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Code */
code {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  background-color: var(--color-gray-100);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}
```

---

## Spacing

### Spacing Scale

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Usage Guidelines

```css
/* Small spacing - Between related items */
.item-group {
  gap: var(--space-2);
}

/* Medium spacing - Between sections within a component */
.card-content {
  padding: var(--space-4);
}

/* Large spacing - Between major sections */
.page-section {
  margin-bottom: var(--space-12);
}
```

---

## Border and Radius

### Border Widths

```css
--border-width-thin: 1px;
--border-width-medium: 2px;
--border-width-thick: 4px;
```

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-full: 9999px;  /* Fully rounded */
```

### Border Colors

```css
--border-color-default: var(--color-gray-200);
--border-color-strong: var(--color-gray-300);
--border-color-focus: var(--color-primary);
```

---

## Shadows

### Shadow Scale

```css
/* Subtle shadow for cards */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Default shadow for elevated elements */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1),
             0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Prominent shadow for modals */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1),
             0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Strong shadow for dropdowns */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1),
             0 8px 10px -6px rgb(0 0 0 / 0.1);
```

---

## Components

### Buttons

```css
/* Primary button */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-primary:active {
  background-color: var(--color-primary-active);
}

.btn-primary:disabled {
  background-color: var(--color-gray-300);
  cursor: not-allowed;
}

/* Secondary button */
.btn-secondary {
  background-color: transparent;
  color: var(--color-text-primary);
  border: var(--border-width-thin) solid var(--border-color-default);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
}

.btn-secondary:hover {
  background-color: var(--color-gray-50);
}

/* Danger button */
.btn-danger {
  background-color: var(--color-error);
  color: var(--color-text-inverse);
}

/* Button sizes */
.btn-sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-sm);
}

.btn-lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-lg);
}
```

### Input Fields

```css
.input {
  padding: var(--space-2) var(--space-3);
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
}

.input:disabled {
  background-color: var(--color-gray-100);
  cursor: not-allowed;
}

.input.error {
  border-color: var(--color-error);
}

/* Input with label */
.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.input-error {
  font-size: var(--font-size-sm);
  color: var(--color-error);
}
```

### Cards

```css
.card {
  background-color: var(--color-bg-primary);
  border: var(--border-width-thin) solid var(--border-color-default);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.card-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: var(--border-width-thin) solid var(--border-color-default);
}

.card-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.card-body {
  color: var(--color-text-secondary);
}
```

### Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.badge-primary {
  background-color: var(--color-info-light);
  color: var(--color-info-dark);
}

.badge-success {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

.badge-error {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}

.badge-warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning-dark);
}
```

### Alerts

```css
.alert {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border-left: var(--border-width-thick) solid;
}

.alert-info {
  background-color: var(--color-info-light);
  border-color: var(--color-info);
  color: var(--color-info-dark);
}

.alert-success {
  background-color: var(--color-success-light);
  border-color: var(--color-success);
  color: var(--color-success-dark);
}

.alert-error {
  background-color: var(--color-error-light);
  border-color: var(--color-error);
  color: var(--color-error-dark);
}

.alert-warning {
  background-color: var(--color-warning-light);
  border-color: var(--color-warning);
  color: var(--color-warning-dark);
}
```

### Modals

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: var(--space-6);
  border-bottom: var(--border-width-thin) solid var(--border-color-default);
}

.modal-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}

.modal-body {
  padding: var(--space-6);
}

.modal-footer {
  padding: var(--space-6);
  border-top: var(--border-width-thin) solid var(--border-color-default);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}
```

---

## Layout

### Container

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.container-sm {
  max-width: 640px;
}

.container-md {
  max-width: 768px;
}

.container-lg {
  max-width: 1024px;
}

.container-xl {
  max-width: 1280px;
}
```

### Grid

```css
.grid {
  display: grid;
  gap: var(--space-4);
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* Responsive grid */
@media (max-width: 768px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}
```

### Flex

```css
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: var(--space-2);
}

.gap-4 {
  gap: var(--space-4);
}
```

---

## Icons

### Icon Sizing

```css
.icon-sm {
  width: 1rem;
  height: 1rem;
}

.icon-md {
  width: 1.25rem;
  height: 1.25rem;
}

.icon-lg {
  width: 1.5rem;
  height: 1.5rem;
}

.icon-xl {
  width: 2rem;
  height: 2rem;
}
```

### Icon Usage

- Use icons to supplement text, not replace it
- Maintain consistent icon style throughout the app
- Use appropriate size for context
- Consider accessibility (provide text alternatives)

---

## Animation and Transitions

### Timing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Transition Durations

```css
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
```

### Common Transitions

```css
/* Fade in */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Slide up */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Usage */
.animate-fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.animate-slide-up {
  animation: slideUp var(--duration-normal) var(--ease-out);
}
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Desktops */
--breakpoint-xl: 1280px;  /* Large desktops */
```

### Media Queries

```css
/* Mobile (default) */
.sidebar {
  width: 100%;
}

/* Tablet and up */
@media (min-width: 768px) {
  .sidebar {
    width: 250px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .sidebar {
    width: 300px;
  }
}
```

---

## Accessibility

### Focus States

```css
/* Visible focus indicator */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove default outline */
*:focus {
  outline: none;
}
```

### Color Contrast

- Maintain WCAG AA contrast ratio (4.5:1 for normal text)
- Use WCAG AAA for important content (7:1)
- Test with color blindness simulators

### Text Sizing

- Use relative units (rem, em) instead of px
- Allow text to scale up to 200%
- Minimum font size: 14px (0.875rem)

---

## Best Practices Summary

### Do's ✅

- Use **consistent spacing** from the scale
- Apply **semantic colors** for actions and states
- Maintain **proper contrast** for readability
- Use **smooth transitions** for interactions
- Design **mobile-first** (responsive)
- Provide **clear focus indicators**
- Use **descriptive colors** for status (green=success, red=error)
- Keep **visual hierarchy** clear
- Use **white space** effectively
- Test with **different screen sizes**

### Don'ts ❌

- Don't use **random spacing values**
- Don't use **too many colors**
- Don't **hide focus indicators**
- Don't use **color alone** to convey meaning
- Don't make **text too small** (< 14px)
- Don't **animate everything** (use purposefully)
- Don't ignore **accessibility**
- Don't create **inconsistent patterns**
- Don't use **low contrast** text
- Don't forget **loading states**

---

## Theming with CSS Variables

### Theme Structure

```css
/* styles/themes/base.css - Base variables */
:root {
  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;

  /* Border */
  --border-radius: 0.375rem;
  --border-width: 1px;

  /* Transitions */
  --transition-duration: 150ms;
  --transition-timing: ease;
}

/* styles/themes/light.css - Light theme */
[data-theme='light'] {
  --primary-color: #2563eb;
  --primary-color-text: #ffffff;

  --surface-ground: #f9fafb;
  --surface-card: #ffffff;
  --surface-border: #e5e7eb;

  --text-color: #1f2937;
  --text-color-secondary: #6b7280;
}

/* styles/themes/dark.css - Dark theme */
[data-theme='dark'] {
  --primary-color: #3b82f6;
  --primary-color-text: #ffffff;

  --surface-ground: #1f2937;
  --surface-card: #374151;
  --surface-border: #4b5563;

  --text-color: #f9fafb;
  --text-color-secondary: #d1d5db;
}
```

### Theme Switching

```typescript
// hooks/useTheme.ts
import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    // Apply to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, setTheme, toggleTheme };
}
```

### Using Variables in Components

```css
/* GameBoard.module.css */
.board {
  background-color: var(--surface-card);
  border: var(--border-width) solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: var(--spacing-4);
}

.cell {
  background-color: var(--surface-ground);
  color: var(--text-color);
  transition: all var(--transition-duration) var(--transition-timing);
}

.cell:hover {
  background-color: var(--primary-color);
  color: var(--primary-color-text);
}
```

### PrimeReact Theme Integration

PrimeReact themes work seamlessly with CSS variables:

```typescript
// main.tsx - Import PrimeReact theme
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Light
// or
import 'primereact/resources/themes/lara-dark-indigo/theme.css';  // Dark

// Switch dynamically
function switchPrimeTheme(theme: 'light' | 'dark') {
  const themeLink = document.getElementById('theme-link') as HTMLLinkElement;
  themeLink.href = theme === 'light'
    ? '/themes/lara-light-indigo/theme.css'
    : '/themes/lara-dark-indigo/theme.css';
}
```

---

**Document End**
