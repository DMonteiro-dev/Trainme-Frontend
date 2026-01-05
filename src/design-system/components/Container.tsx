import type { HTMLAttributes, PropsWithChildren } from 'react';
import { theme } from '../theme';

const widths = {
  sm: '640px',
  md: '960px',
  lg: '1200px',
  full: '100%'
} as const;

export type ContainerProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    maxWidth?: keyof typeof widths;
  }
>;

export const Container = ({ maxWidth = 'lg', style, children, ...props }: ContainerProps) => (
  <div
    style={{
      width: '100%',
      maxWidth: widths[maxWidth],
      margin: '0 auto',
      padding: `0 ${theme.spacing.lg}`,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);
