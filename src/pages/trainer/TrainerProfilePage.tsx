import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Page } from '../../design-system/components/Page';
import { Card } from '../../design-system/components/Card';
import { TextField } from '../../design-system/components/TextField';
import { Button } from '../../design-system/components/Button';
import { theme } from '../../design-system/theme';
import { useTrainerProfile, useUpdateTrainerProfile } from '../../hooks/useTrainerQueries';
import { QRCodeDisplay } from '../../components/auth/QRCodeDisplay';

const profileSchema = z.object({
  bio: z.string().optional(),
  specialties: z.string().optional(),
  yearsOfExperience: z.coerce.number().optional(),
  pricePerSession: z.coerce.number().optional(),
  location: z.string().optional(),
  onlineSessionsAvailable: z.boolean().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  website: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const TrainerProfilePage = () => {
  const { data: profile, isLoading } = useTrainerProfile();
  const { mutateAsync, isPending } = useUpdateTrainerProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: '',
      specialties: '',
      yearsOfExperience: undefined,
      pricePerSession: undefined,
      location: '',
      onlineSessionsAvailable: false,
      instagram: '',
      youtube: '',
      website: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        bio: profile.bio ?? '',
        specialties: profile.specialties?.join(', ') ?? '',
        yearsOfExperience: profile.yearsOfExperience,
        pricePerSession: profile.pricePerSession,
        location: profile.location ?? '',
        onlineSessionsAvailable: profile.onlineSessionsAvailable ?? false,
        instagram: profile.socialLinks?.instagram ?? '',
        youtube: profile.socialLinks?.youtube ?? '',
        website: profile.socialLinks?.website ?? '',
      });
    }
  }, [profile, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await mutateAsync({
      bio: values.bio,
      specialties: values.specialties?.split(',').map((tag) => tag.trim()).filter(Boolean),
      yearsOfExperience: values.yearsOfExperience,
      pricePerSession: values.pricePerSession,
      location: values.location,
      onlineSessionsAvailable: values.onlineSessionsAvailable,
      socialLinks: {
        instagram: values.instagram,
        youtube: values.youtube,
        website: values.website,
      },
    });
  });

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>A carregar o teu perfil...</div>;
  }

  return (
    <Page title="Perfil do treinador" description="Mantém o teu perfil atrativo para receber novos clientes.">
      <Card>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: theme.spacing.md, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'inline-block', marginBottom: theme.spacing.xs }}>Bio</label>
            <textarea
              {...register('bio')}
              style={{
                width: '100%',
                minHeight: '120px',
                background: theme.colors.surfaceAlt,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii.md,
                color: theme.colors.text,
                padding: '0.65rem 0.9rem',
                font: 'inherit',
              }}
            />
            {errors.bio && <p style={{ color: theme.colors.danger }}>{errors.bio.message}</p>}
          </div>

          <TextField
            label="Especialidades (separadas por vírgulas)"
            {...register('specialties')}
            error={errors.specialties?.message}
          />
          <TextField label="Anos de experiência" type="number" {...register('yearsOfExperience')} error={errors.yearsOfExperience?.message} />
          <TextField label="Preço por sessão" type="number" step="0.1" {...register('pricePerSession')} error={errors.pricePerSession?.message} />
          <TextField label="Localização" {...register('location')} error={errors.location?.message} />

          <label style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
            <input type="checkbox" {...register('onlineSessionsAvailable')} /> Disponível para sessões online
          </label>

          <TextField label="Instagram" {...register('instagram')} />
          <TextField label="YouTube" {...register('youtube')} />
          <TextField label="Website" {...register('website')} />

          <Button type="submit" disabled={isPending}>
            {isPending ? 'A guardar...' : 'Guardar alterações'}
          </Button>
        </form>
      </Card>

      <Card style={{ marginTop: theme.spacing.lg }}>
        <h3 style={{ marginBottom: theme.spacing.md }}>Código QR de Login</h3>
        <QRCodeDisplay />
      </Card>
    </Page>
  );
};

export default TrainerProfilePage;
