import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from 'react';
import { theme } from '../theme';
import { useTheme } from '../../context/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: {
    padding: '0.4rem 0.9rem',
    fontSize: theme.typography.sizes.sm,
  },
  md: {
    padding: '0.55rem 1.2rem',
    fontSize: theme.typography.sizes.md,
  },
  lg: {
    padding: '0.8rem 1.5rem',
    fontSize: theme.typography.sizes.lg,
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, style, ...props }, ref) => {
    const { currentColors } = useTheme();

    const variantStyles: Record<ButtonVariant, CSSProperties> = {
      primary: {
        background: theme.colors.primary,
        color: '#FFFFFF', // Keep primary text white/light usually
        border: `1px solid ${theme.colors.primaryDark}`,
      },
      secondary: {
        background: currentColors.surfaceAlt,
        color: currentColors.text,
        border: `1px solid ${currentColors.border}`,
      },
      ghost: {
        background: 'transparent',
        color: currentColors.text,
        border: `1px solid transparent`, // Fixed transparent border
      },
      outline: {
        background: 'transparent',
        color: theme.colors.primary,
        border: `1px solid ${theme.colors.primary}`,
      },
    };

    return (
      <button
        ref={ref}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.xs,
          borderRadius: theme.radii.md,
          cursor: 'pointer',
          fontWeight: theme.typography.weights.semibold,
          transition: 'transform 150ms ease, box-shadow 150ms ease',
          width: fullWidth ? '100%' : undefined,
          boxShadow: '0 10px 25px rgba(10, 10, 25, 0.1)',
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style,
        }}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
