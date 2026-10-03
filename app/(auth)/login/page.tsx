'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/features/auth/useAuth';

const loginSchema = z.object({
  email: z.string().email('יש להזין כתובת אימייל תקינה'),
  password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginFormData) {
    try {
      await loginMutation.mutateAsync(data);
      router.push('/catalog');
    } catch {
      // error is surfaced via loginMutation.error
    }
  }

  const apiError =
    loginMutation.error instanceof Error
      ? loginMutation.error.message
      : loginMutation.error
      ? 'הכניסה נכשלה. נסה שוב.'
      : null;

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      {/* Top section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* WP Logo mark */}
        <div className="w-16 h-16 rounded-2xl bg-[#3B82F6] flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30">
          <span className="text-white text-2xl font-black tracking-tight select-none">WP</span>
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-2">ברוך הבא</h1>
        <p className="text-slate-400 text-base text-center">כניסה לחשבון B2B שלך</p>
      </div>

      {/* Form section */}
      <div className="w-full max-w-md mx-auto px-6 pb-12">
        <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/60 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                אימייל
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@company.com"
                className={[
                  'w-full bg-slate-900/80 border rounded-xl px-4 py-3 text-white placeholder-slate-500',
                  'text-sm outline-none transition-colors duration-150',
                  'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  errors.email ? 'border-red-500' : 'border-slate-700',
                ].join(' ')}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-0.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                סיסמה
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={[
                    'w-full bg-slate-900/80 border rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-500',
                    'text-sm outline-none transition-colors duration-150',
                    'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    errors.password ? 'border-red-500' : 'border-slate-700',
                  ].join(' ')}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* API error */}
            {apiError && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-red-400">{apiError}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className={[
                'w-full flex items-center justify-center gap-2.5 h-12 rounded-xl text-sm font-semibold text-white',
                'bg-[#3B82F6] hover:bg-blue-500 active:bg-blue-700 transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800',
                loginMutation.isPending ? 'opacity-70 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {loginMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  מתחבר...
                </>
              ) : (
                'כניסה'
              )}
            </button>

            {/* Forgot password */}
            <button
              type="button"
              className="text-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              שכחת סיסמה?
            </button>

            <div className="border-t border-slate-700 pt-2 text-center text-sm text-slate-400">
              עסק חדש?{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                פתח חשבון B2B
              </button>
            </div>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">פרטי כניסה לדמו</p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">אימייל</span>
              <span className="text-xs font-mono text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded">
                buyer@acmecorp.com
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">סיסמה</span>
              <span className="text-xs font-mono text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded">
                password123
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
