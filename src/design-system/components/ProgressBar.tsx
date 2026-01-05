import { theme } from '../theme';

type ProgressBarProps = {
  value: number;
  label?: string;
};

export const ProgressBar = ({ value, label }: ProgressBarProps) => {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: '8px',
          borderRadius: theme.radii.pill,
          background: theme.colors.surfaceAlt,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            background: theme.colors.primary,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};
