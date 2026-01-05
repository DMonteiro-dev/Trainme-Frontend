import type { CSSProperties, HTMLAttributes } from 'react';
import { theme } from '../theme';

type BadgeTone = 'default' | 'success' | 'danger' | 'warning';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneStyles: Record<BadgeTone, CSSProperties> = {
  default: {
    background: theme.colors.surfaceAlt,
    color: theme.colors.text,
  },
  success: {
    background: 'rgba(34, 197, 94, 0.15)',
    color: theme.colors.success,
  },
  danger: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: theme.colors.danger,
  },
  warning: {
    background: 'rgba(234, 179, 8, 0.15)',
    color: theme.colors.warning,
  },
};

export const Badge = ({ tone = 'default', style, ...props }: BadgeProps) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.15rem 0.7rem',
      borderRadius: theme.radii.pill,
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.medium,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      border: `1px solid ${theme.colors.border}`,
      ...toneStyles[tone],
      ...style,
    }}
    {...props}
  />
);
