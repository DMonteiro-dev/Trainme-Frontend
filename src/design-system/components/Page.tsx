import type { PropsWithChildren, ReactNode } from 'react';
import { theme } from '../theme';
import { useTheme } from '../../context/ThemeContext';

export type PageProps = PropsWithChildren<{
  title?: string;
  description?: string;
  actions?: ReactNode;
}>;

export const Page = ({ title, description, actions, children }: PageProps) => {
  const { currentColors } = useTheme();

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.lg,
      }}
    >
      {(title || description || actions) && (
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: theme.spacing.md,
          }}
        >
          <div>
            {title && (
              <h1
                style={{
                  margin: 0,
                  fontSize: theme.typography.sizes.xl,
                  fontWeight: theme.typography.weights.bold,
                  color: currentColors.text,
                }}
              >
                {title}
              </h1>
            )}
            {description && (
              <p
                style={{
                  marginTop: theme.spacing.xs,
                  marginBottom: 0,
                  color: currentColors.textMuted,
                  maxWidth: '54ch',
                  fontSize: theme.typography.sizes.md,
                }}
              >
                {description}
              </p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </header>
      )}

      {children}
    </section>
  );
};
