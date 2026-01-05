import type { HTMLAttributes } from 'react';
import { theme } from '../theme';
import { useTheme } from '../../context/ThemeContext';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: keyof typeof theme.spacing;
};

export const Card = ({ padding = 'lg', style, ...props }: CardProps) => {
  const { currentColors } = useTheme();

  return (
    <div
      style={{
        background: currentColors.surface,
        borderRadius: theme.radii.md,
        border: `1px solid ${currentColors.border}`,
        boxShadow: '0 20px 45px rgba(5, 6, 10, 0.15)', // Reduced opacity for better look in both modes
        padding: theme.spacing[padding],
        ...style,
      }}
      {...props}
    />
  );
};
