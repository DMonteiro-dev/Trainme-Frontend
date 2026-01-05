import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { TextField } from '../../design-system/components/TextField';
import { Button } from '../../design-system/components/Button';
import { Modal } from '../../design-system/components/Modal';
import { theme } from '../../design-system/theme';
import { useTheme } from '../../context/ThemeContext';
import { useCreateProgressLog, useProgressLogs } from '../../hooks/useClientQueries';
import { Plus, TrendingUp, TrendingDown, Minus, Scale, Calendar } from 'lucide-react';

const coerceRequiredNumber = (message: string, positiveMessage: string) =>
  z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return undefined;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    },
    z.number({ required_error: message }).positive(positiveMessage),
  );

const optionalNumber = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  },
  z.number().nonnegative().optional(),
);

const progressSchema = z.object({
  date: z.string().min(1, 'Escolhe uma data'),
  weight: coerceRequiredNumber('Indica o peso', 'O peso tem de ser positivo'),
  bodyFatPercent: optionalNumber.refine((value) => value === undefined || value <= 100, {
    message: 'Percentagem inválida',
  }),
  measurements: z.string().optional(),
  notes: z.string().optional(),
});

type ProgressFormValues = z.input<typeof progressSchema>;
type ProgressPayload = z.infer<typeof progressSchema>;

const parseMeasurements = (raw?: string) => {
  if (!raw) return undefined;
  const entries = raw
    .split('\n')
    .map((line) => line.split(':'))
    .filter(([key, value]) => key && value);

  if (!entries.length) return undefined;

  const mapped: Record<string, number> = {};
  entries.forEach(([key, value]) => {
    const num = Number(value.trim());
    if (!Number.isNaN(num)) {
      mapped[key.trim()] = num;
    }
  });

  return Object.keys(mapped).length ? mapped : undefined;
};

const ProgressOverviewPage = () => {
  const { currentColors } = useTheme();
  const { data: logs, isLoading } = useProgressLogs();
  const { mutateAsync, isPending } = useCreateProgressLog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProgressFormValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      weight: undefined,
      bodyFatPercent: undefined,
      measurements: '',
      notes: '',
    },
  });

  const sortedLogs = useMemo(() => {
    if (!logs) return [];
    return [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs]);

  const chartData = useMemo(() => {
    if (!logs) return [];
    return [...logs]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((log) => ({
        date: new Date(log.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
        fullDate: new Date(log.date).toLocaleDateString('pt-PT'),
        weight: log.weight,
      }));
  }, [logs]);

  const stats = useMemo(() => {
    if (!sortedLogs.length) return null;
    const current = sortedLogs[0];
    const previous = sortedLogs.length > 1 ? sortedLogs[1] : null;
    const first = sortedLogs[sortedLogs.length - 1];

    const weightChange = previous ? current.weight - previous.weight : 0;
    const totalChange = current.weight - first.weight;

    return {
      currentWeight: current.weight,
      lastDate: new Date(current.date).toLocaleDateString('pt-PT'),
      weightChange,
      totalChange,
      logsCount: sortedLogs.length,
    };
  }, [sortedLogs]);

  const onSubmit = handleSubmit(async (values) => {
    const parsed = progressSchema.parse(values) as ProgressPayload;
    await mutateAsync({
      date: parsed.date,
      weight: parsed.weight,
      bodyFatPercent: parsed.bodyFatPercent,
      notes: parsed.notes || undefined,
      measurements: parseMeasurements(values.measurements),
    });
    reset({
      date: new Date().toISOString().split('T')[0],
      weight: undefined,
      bodyFatPercent: undefined,
      measurements: '',
      notes: '',
    });
    setIsModalOpen(false);
  });

  if (isLoading) {
    return (
      <Page title="Progresso">
        <div style={{ padding: theme.spacing.xl, textAlign: 'center', color: currentColors.textMuted }}>
          A carregar o teu progresso...
        </div>
      </Page>
    );
  }

  return (
    <Page
      title="O Meu Progresso"
      description="Acompanha a tua evolução, regista pesos e medidas."
      actions={
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} style={{ marginRight: theme.spacing.xs }} />
          Registar Progresso
        </Button>
      }
    >
      {/* Summary Cards */}
      <div style={{ display: 'grid', gap: theme.spacing.lg, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: theme.spacing.xl }}>
        <Card style={{ background: `linear-gradient(135deg, ${theme.colors.primary}15, ${currentColors.surface})`, border: `1px solid ${theme.colors.primary}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ padding: theme.spacing.md, background: currentColors.surface, borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Scale size={24} color={theme.colors.primary} />
            </div>
            <div>
              <p style={{ margin: 0, color: currentColors.textMuted, fontSize: '0.9rem' }}>Peso Atual</p>
              <h2 style={{ margin: 0, fontSize: '2rem' }}>{stats?.currentWeight ?? '--'} <span style={{ fontSize: '1rem', fontWeight: 400, color: currentColors.textMuted }}>kg</span></h2>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ padding: theme.spacing.md, background: currentColors.surfaceAlt, borderRadius: '50%' }}>
              {stats && stats.weightChange < 0 ? (
                <TrendingDown size={24} color={theme.colors.success} />
              ) : stats && stats.weightChange > 0 ? (
                <TrendingUp size={24} color={theme.colors.danger} />
              ) : (
                <Minus size={24} color={currentColors.textMuted} />
              )}
            </div>
            <div>
              <p style={{ margin: 0, color: currentColors.textMuted, fontSize: '0.9rem' }}>Última Variação</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: theme.spacing.xs }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: stats && stats.weightChange > 0 ? theme.colors.danger : stats && stats.weightChange < 0 ? theme.colors.success : currentColors.text }}>
                  {stats ? Math.abs(stats.weightChange).toFixed(1) : '--'}
                </h2>
                <span style={{ color: currentColors.textMuted }}>kg</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ padding: theme.spacing.md, background: currentColors.surfaceAlt, borderRadius: '50%' }}>
              <Calendar size={24} color={theme.colors.secondary} />
            </div>
            <div>
              <p style={{ margin: 0, color: currentColors.textMuted, fontSize: '0.9rem' }}>Total Registos</p>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{stats?.logsCount ?? 0}</h2>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) minmax(280px, 1fr)', gap: theme.spacing.lg, alignItems: 'start' }}>

        {/* Chart Section */}
        <Card style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginTop: 0, marginBottom: theme.spacing.lg }}>Evolução do Peso</h3>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.colors.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={theme.colors.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={currentColors.border} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke={currentColors.textMuted}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke={currentColors.textMuted}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip
                  contentStyle={{
                    background: currentColors.surface,
                    border: `1px solid ${currentColors.border}`,
                    borderRadius: theme.radii.md,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  labelStyle={{ color: currentColors.textMuted, marginBottom: '0.25rem' }}
                  itemStyle={{ color: theme.colors.primary, fontWeight: 600 }}
                  formatter={(value: number) => [`${value} kg`, 'Peso']}
                  labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke={theme.colors.primary}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentColors.textMuted }}>
              Regista o teu peso para veres o gráfico de evolução.
            </div>
          )}
        </Card>

        {/* History List */}
        <Card style={{ maxHeight: '600px', overflowY: 'auto', padding: 0 }}>
          <div style={{ padding: theme.spacing.lg, borderBottom: `1px solid ${currentColors.border}`, position: 'sticky', top: 0, background: currentColors.surface, zIndex: 1 }}>
            <h3 style={{ margin: 0 }}>Histórico</h3>
          </div>
          <div style={{ padding: `0 ${theme.spacing.lg}` }}>
            {sortedLogs.length ? (
              <ul style={{ listStyle: 'none', margin: 0, padding: `${theme.spacing.md} 0` }}>
                {sortedLogs.map((log, index) => {
                  const prevLog = sortedLogs[index + 1];
                  const change = prevLog ? log.weight - prevLog.weight : 0;

                  return (
                    <li key={log.id} style={{
                      padding: `${theme.spacing.md} 0`,
                      borderBottom: index !== sortedLogs.length - 1 ? `1px solid ${currentColors.border}` : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{log.weight} kg</div>
                        <div style={{ fontSize: '0.85rem', color: currentColors.textMuted }}>
                          {new Date(log.date).toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'long' })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                        {prevLog && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            color: change > 0 ? theme.colors.danger : change < 0 ? theme.colors.success : currentColors.textMuted
                          }}>
                            {change > 0 ? <TrendingUp size={16} /> : change < 0 ? <TrendingDown size={16} /> : <Minus size={16} />}
                            {Math.abs(change).toFixed(1)}
                          </div>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => setSelectedLog(log)}>
                          Ver detalhes
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div style={{ padding: theme.spacing.xl, textAlign: 'center', color: currentColors.textMuted }}>
                Ainda não tens registos.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Log Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registar Progresso"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={onSubmit} disabled={isPending}>{isPending ? 'A guardar...' : 'Guardar Registo'}</Button>
          </>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <TextField type="date" label="Data" error={errors.date?.message} {...register('date')} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
            <TextField type="number" step="0.1" label="Peso (kg)" error={errors.weight?.message} {...register('weight')} />
            <TextField
              type="number"
              step="0.1"
              label="% Gordura Corporal"
              error={errors.bodyFatPercent?.message}
              {...register('bodyFatPercent')}
            />
          </div>

          <div>
            <label
              htmlFor="measurements"
              style={{ display: 'block', marginBottom: theme.spacing.xs, fontWeight: 500 }}
            >
              Medidas (opcional)
            </label>
            <textarea
              id="measurements"
              placeholder="Ex: Cintura: 80&#10;Anca: 95"
              {...register('measurements')}
              style={{
                width: '100%',
                minHeight: '80px',
                background: currentColors.surfaceAlt,
                color: currentColors.text,
                border: `1px solid ${currentColors.border}`,
                borderRadius: theme.radii.md,
                padding: '0.65rem 0.9rem',
                font: 'inherit',
                resize: 'vertical'
              }}
            />
            <p style={{ fontSize: '0.8rem', color: currentColors.textMuted, marginTop: 4 }}>
              Formato: Nome: Valor (uma por linha)
            </p>
          </div>

          <div>
            <label
              htmlFor="notes"
              style={{ display: 'block', marginBottom: theme.spacing.xs, fontWeight: 500 }}
            >
              Notas
            </label>
            <textarea
              id="notes"
              placeholder="Como te sentes? Energia, sono, etc..."
              {...register('notes')}
              style={{
                width: '100%',
                minHeight: '80px',
                background: currentColors.surfaceAlt,
                color: currentColors.text,
                border: `1px solid ${currentColors.border}`,
                borderRadius: theme.radii.md,
                padding: '0.65rem 0.9rem',
                font: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Detalhes do Registo"
        footer={
          <Button onClick={() => setSelectedLog(null)}>Fechar</Button>
        }
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
              <div style={{ background: currentColors.surfaceAlt, padding: theme.spacing.md, borderRadius: theme.radii.md }}>
                <div style={{ fontSize: '0.85rem', color: currentColors.textMuted, marginBottom: 4 }}>Data</div>
                <div style={{ fontWeight: 600 }}>{new Date(selectedLog.date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <div style={{ background: currentColors.surfaceAlt, padding: theme.spacing.md, borderRadius: theme.radii.md }}>
                <div style={{ fontSize: '0.85rem', color: currentColors.textMuted, marginBottom: 4 }}>Peso</div>
                <div style={{ fontWeight: 600, fontSize: '1.2rem', color: theme.colors.primary }}>{selectedLog.weight} kg</div>
              </div>
            </div>

            {selectedLog.bodyFatPercent !== undefined && (
              <div style={{ background: currentColors.surfaceAlt, padding: theme.spacing.md, borderRadius: theme.radii.md }}>
                <div style={{ fontSize: '0.85rem', color: currentColors.textMuted, marginBottom: 4 }}>Gordura Corporal</div>
                <div style={{ fontWeight: 600 }}>{selectedLog.bodyFatPercent}%</div>
              </div>
            )}

            {selectedLog.measurements && Object.keys(selectedLog.measurements).length > 0 && (
              <div>
                <h4 style={{ marginTop: 0, marginBottom: theme.spacing.sm }}>Medidas</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: theme.spacing.sm }}>
                  {Object.entries(selectedLog.measurements).map(([key, value]) => (
                    <div key={key} style={{ background: currentColors.surfaceAlt, padding: theme.spacing.sm, borderRadius: theme.radii.sm }}>
                      <div style={{ fontSize: '0.8rem', color: currentColors.textMuted, textTransform: 'capitalize' }}>{key}</div>
                      <div style={{ fontWeight: 600 }}>{String(value)} cm</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedLog.notes && (
              <div>
                <h4 style={{ marginTop: 0, marginBottom: theme.spacing.sm }}>Notas</h4>
                <div style={{ background: currentColors.surfaceAlt, padding: theme.spacing.md, borderRadius: theme.radii.md, fontStyle: 'italic', color: currentColors.textMuted }}>
                  "{selectedLog.notes}"
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Page>
  );
};

export default ProgressOverviewPage;
