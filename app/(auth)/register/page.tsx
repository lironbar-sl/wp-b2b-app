'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useRegister } from '@/features/auth/useAuth';
import type { BusinessType } from '@/types';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'יש להזין שם פרטי'),
    lastName: z.string().min(2, 'יש להזין שם משפחה'),
    businessName: z.string().min(2, 'יש להזין שם עסק'),
    businessType: z.enum(['authorized_dealer', 'company'] as const),
    businessId: z.string().min(9, 'מספר עוסק/ח.פ חייב להכיל 9 ספרות').max(9, 'מספר עוסק/ח.פ חייב להכיל 9 ספרות').regex(/^\d+$/, 'מספר עוסק/ח.פ חייב להכיל ספרות בלבד'),
    email: z.string().email('יש להזין כתובת אימייל תקינה'),
    phone: z.string().min(9, 'יש להזין מספר טלפון תקין').regex(/^[0-9+\-\s]+$/, 'מספר טלפון לא תקין'),
    deliveryAddress: z.string().min(5, 'יש להזין כתובת למשלוח'),
    deliveryCity: z.string().min(2, 'יש להזין עיר'),
    password: z.string().min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'הסיסמאות אינן תואמות',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof registerSchema>;

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const INPUT_CLASS =
  'w-full bg-slate-900/80 border rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none transition-colors duration-150 focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const inputCls = (hasError: boolean) =>
  `${INPUT_CLASS} ${hasError ? 'border-red-500' : 'border-slate-700'}`;

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      businessType: 'authorized_dealer',
    },
  });

  const selectedType = watch('businessType') as BusinessType;

  async function onSubmit(data: FormData) {
    try {
      await registerMutation.mutateAsync(data);
      router.push('/catalog');
    } catch {
      // error surfaced via registerMutation.error
    }
  }

  const apiError =
    registerMutation.error instanceof Error
      ? registerMutation.error.message
      : registerMutation.error
      ? 'ההרשמה נכשלה. נסה שוב.'
      : null;

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur-sm px-4 pt-12 pb-4 flex items-center gap-3 border-b border-slate-800">
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="חזרה לכניסה"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">הרשמה לחשבון B2B</h1>
          <p className="text-xs text-slate-400">מלא את הפרטים לפתיחת חשבון עסקי</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">

          {/* Personal info section */}
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 flex flex-col gap-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">פרטים אישיים</p>

            <div className="grid grid-cols-2 gap-3">
              <Field label="שם פרטי" error={errors.firstName?.message}>
                <input
                  type="text"
                  autoComplete="given-name"
                  placeholder="ישראל"
                  className={inputCls(!!errors.firstName)}
                  {...register('firstName')}
                />
              </Field>
              <Field label="שם משפחה" error={errors.lastName?.message}>
                <input
                  type="text"
                  autoComplete="family-name"
                  placeholder="ישראלי"
                  className={inputCls(!!errors.lastName)}
                  {...register('lastName')}
                />
              </Field>
            </div>

            <Field label="אימייל" error={errors.email?.message}>
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@company.com"
                className={inputCls(!!errors.email)}
                {...register('email')}
              />
            </Field>

            <Field label="מספר טלפון" error={errors.phone?.message}>
              <input
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="050-000-0000"
                className={inputCls(!!errors.phone)}
                dir="ltr"
                {...register('phone')}
              />
            </Field>
          </div>

          {/* Business info section */}
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 flex flex-col gap-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">פרטי העסק</p>

            <Field label="שם עסק לחשבוניות" error={errors.businessName?.message}>
              <input
                type="text"
                placeholder="שם העסק כפי שיופיע בחשבוניות"
                className={inputCls(!!errors.businessName)}
                {...register('businessName')}
              />
            </Field>

            <Field label="סוג עסק" error={errors.businessType?.message}>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: 'authorized_dealer', label: 'עוסק מורשה' },
                    { value: 'company', label: 'חברה בע"מ' },
                  ] as { value: BusinessType; label: string }[]
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('businessType', value, { shouldValidate: true })}
                    className={[
                      'py-2.5 px-3 rounded-xl text-sm font-medium border transition-colors duration-150 text-center',
                      selectedType === value
                        ? 'bg-blue-500 border-blue-400 text-white'
                        : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-600',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>

            <Field
              label={selectedType === 'company' ? 'מספר ח.פ' : 'מספר עוסק מורשה'}
              error={errors.businessId?.message}
            >
              <input
                type="text"
                inputMode="numeric"
                placeholder="9 ספרות"
                maxLength={9}
                className={inputCls(!!errors.businessId)}
                dir="ltr"
                {...register('businessId')}
              />
            </Field>
          </div>

          {/* Delivery address section */}
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 flex flex-col gap-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">כתובת למשלוחים</p>

            <Field label="רחוב ומספר" error={errors.deliveryAddress?.message}>
              <input
                type="text"
                autoComplete="street-address"
                placeholder="רחוב הרצל 10"
                className={inputCls(!!errors.deliveryAddress)}
                {...register('deliveryAddress')}
              />
            </Field>

            <Field label="עיר" error={errors.deliveryCity?.message}>
              <input
                type="text"
                autoComplete="address-level2"
                placeholder="תל אביב"
                className={inputCls(!!errors.deliveryCity)}
                {...register('deliveryCity')}
              />
            </Field>
          </div>

          {/* Password section */}
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 flex flex-col gap-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">סיסמה</p>

            <Field label="סיסמה" error={errors.password?.message}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="לפחות 8 תווים"
                  className={`${inputCls(!!errors.password)} pl-11`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </Field>

            <Field label="אימות סיסמה" error={errors.confirmPassword?.message}>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="הזן שוב את הסיסמה"
                  className={`${inputCls(!!errors.confirmPassword)} pl-11`}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  aria-label={showConfirm ? 'הסתר' : 'הצג'}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </Field>
          </div>

          {/* API error */}
          {apiError && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.051 3.378c.866-1.5 3.032-1.5 3.898 0L21.303 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-red-400">{apiError}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-14 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-colors duration-150"
          >
            {registerMutation.isPending ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                נרשם...
              </>
            ) : (
              'פתח חשבון B2B'
            )}
          </button>

          <p className="text-center text-sm text-slate-400">
            כבר יש לך חשבון?{' '}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              כניסה
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
