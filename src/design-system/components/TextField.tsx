import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { theme } from '../theme';
import { useTheme } from '../../context/ThemeContext';

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  helperText?: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
};

export const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  ({ label, helperText, error, style, id, multiline, rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const { currentColors } = useTheme();

    const commonStyles = {
      width: '100%',
      padding: '0.65rem 0.9rem',
      background: currentColors.surfaceAlt,
      color: currentColors.text,
      borderRadius: theme.radii.md,
      border: `1px solid ${error ? theme.colors.danger : currentColors.border}`,
      outline: 'none',
      transition: 'border-color 150ms ease, box-shadow 150ms ease',
      ...style,
      fontFamily: 'inherit'
    };

    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label
            htmlFor={fieldId}
            style={{
              display: 'inline-block',
              marginBottom: theme.spacing.xs,
              color: currentColors.text,
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.medium,
            }}
          >
            {label}
          </label>
        )}

        {multiline ? (
          <textarea
            id={fieldId}
            ref={ref as any}
            rows={rows}
            style={{ ...commonStyles, resize: 'vertical' }}
            {...(props as any)}
          />
        ) : (
          <input
            id={fieldId}
            ref={ref as any}
            style={commonStyles}
            {...props}
          />
        )}

        {(error || helperText) && (
          <p
            style={{
              marginTop: theme.spacing.xs,
              fontSize: theme.typography.sizes.xs,
              color: error ? theme.colors.danger : currentColors.textMuted,
            }}
          >
            {error ?? helperText}
          </p>
        )}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
