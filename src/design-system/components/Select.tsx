import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { theme } from '../theme';
import { useTheme } from '../../context/ThemeContext';
import { ChevronDown } from 'lucide-react';

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
    label?: string;
    helperText?: string;
    error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, helperText, error, style, id, children, ...props }, ref) => {
        const generatedId = useId();
        const fieldId = id ?? generatedId;
        const { currentColors } = useTheme();

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

                <div style={{ position: 'relative', width: '100%' }}>
                    <select
                        id={fieldId}
                        ref={ref}
                        style={{
                            width: '100%',
                            padding: '0.65rem 0.9rem',
                            paddingRight: '2.5rem', // Space for chevron
                            background: currentColors.surfaceAlt,
                            color: currentColors.text,
                            borderRadius: theme.radii.md,
                            border: `1px solid ${error ? theme.colors.danger : currentColors.border}`,
                            outline: 'none',
                            appearance: 'none',
                            transition: 'border-color 150ms ease, box-shadow 150ms ease',
                            cursor: 'pointer',
                            ...style,
                        }}
                        {...props}
                    >
                        {children}
                    </select>
                    <ChevronDown
                        size={16}
                        style={{
                            position: 'absolute',
                            right: '0.9rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: theme.colors.textMuted,
                            pointerEvents: 'none',
                        }}
                    />
                </div>

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

Select.displayName = 'Select';
