import type { ReactNode } from 'react';
import { theme } from '../theme';

type ModalProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
};

export const Modal = ({ isOpen, title, onClose, children, footer, maxWidth = '640px' }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 6, 10, 0.65)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.radii.md,
          border: `1px solid ${theme.colors.border}`,
          padding: theme.spacing.lg,
          width: '100%',
          maxWidth,
          boxShadow: '0 25px 50px rgba(0,0,0,0.45)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
          {title ? <h3 style={{ margin: 0 }}>{title}</h3> : <span />}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              color: theme.colors.textMuted,
              border: 'none',
              cursor: 'pointer',
              fontSize: theme.typography.sizes.lg,
              lineHeight: 1,
            }}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>
        <div>{children}</div>
        {footer && (
          <div style={{ marginTop: theme.spacing.md, display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.sm }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
