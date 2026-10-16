import type { FormikProps } from 'formik';
import type { ReactNode } from 'react';

// The props that bind an MUI TextField to a Formik field: value, handlers, and once the field
// was touched (or the form submitted) a red error state with the message as helper text.
export function fieldProps<T>(formik: FormikProps<T>, name: keyof T & string, helperText?: ReactNode) {
  const error = formik.errors[name] as string | undefined;
  const showError = Boolean(error) && Boolean(formik.touched[name] || formik.submitCount > 0);
  return {
    name,
    value: (formik.values[name] ?? '') as unknown,
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: showError,
    helperText: showError ? error : helperText,
  };
}

// Same check, for custom fields (dropzones, autocompletes) that show their own error.
export function fieldError<T>(formik: FormikProps<T>, name: keyof T & string): string | undefined {
  const error = formik.errors[name] as string | undefined;
  return error && (formik.touched[name] || formik.submitCount > 0) ? error : undefined;
}

export const REQUIRED = "Обов'язкове поле";

// "1 250,50" → 1250.5; NaN when not a number, null when empty.
export function toNumber(value: string): number | null {
  const cleaned = value.replace(/\s/g, '').replace(',', '.');
  return cleaned === '' ? null : Number(cleaned);
}
