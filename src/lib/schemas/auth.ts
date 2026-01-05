import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A palavra-passe deve ter pelo menos 6 caracteres'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        name: z.string().min(2, 'Indica o teu nome completo'),
        email: z.string().email('Email inválido'),
        password: z.string().min(6, 'A palavra-passe deve ter pelo menos 6 caracteres'),
        confirmPassword: z.string().min(6, 'Confirma a palavra-passe'),
        role: z.enum(['client', 'trainer']),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'As palavras-passe têm de coincidir',
        path: ['confirmPassword'],
    });

export type RegisterFormValues = z.infer<typeof registerSchema>;
