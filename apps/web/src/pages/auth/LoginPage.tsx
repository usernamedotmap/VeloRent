import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@/hooks/useAuth';
import React, { useState } from 'react'
import { LoginInput, LoginSchema } from '@velorent/shared';
import AuthCard from '@/components/common/AuthCard';
import { Link, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constant/routes';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sanitizedRedirect } from '@/lib/utils';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [searchParams] = useSearchParams();
  const { mutate: login, isPending, error } = useLogin();

  // reading redirect destianation
  const redirectTo = sanitizedRedirect(
    searchParams.get('redirect')
  );

  const { register, handleSubmit, formState: { errors }, } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    login({
      ...data, redirectTo: redirectTo ?? undefined
    }, {
      onSuccess: () => {
        // client side only
        if (!rememberMe) {
          sessionStorage.setItem('velorent-session-only', 'true');
        }
      },
    });
  };

  const apiError = (error as any)?.response?.data?.error?.message;

  return (
    <AuthCard
      title="Welcome Back"
      description='Sign in to your 3Jremy account'
      footer={
        <span>Don't have an account?{' '}
          <Link
            to={
              redirectTo
                ? `${ROUTES.REGISTER}?redirect=${encodeURIComponent(redirectTo)}`
                : ROUTES.REGISTER
            }
            className="text-[hsl(var(--primary))] font-semibold hover:underline">
            Create one free
          </Link>
        </span>
      }>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5' noValidate>

        {/* api Error */}
        {apiError && (
          <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2'>
            <span>⚠</span>
            {apiError}
          </div>
        )}

        {/* email */}
        <Input
          label="Email Address"
          type="email"
          placeholder="baby@email.com"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register('email')} />

        {/* Password */}
        <div className='relative'>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder='Enter your password'
            autoComplete='current-password'
            required
            error={errors.password?.message}
            {...register('password')} />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* remember me + forgor password */}
        <div className="flex items-center justify-between">
          <label className='flex items-center gap-2 cursor-pointer select-none'>
            <input
              type='checkbox'
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[hsl(var(--border))] accent-[hsl(var(--primary))]"
            />
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              Remember me
            </span>
          </label>
          <Link
            to='/forgot/password'
            className="text-sm text-[hsl(var(--primary))] hover:underline font-medium">
            Forgot Password
          </Link>
        </div>

        <Button
          type='submit'
          fullWidth
          size='lg'
          loading={isPending}>
          {isPending ? 'Signing in...' : 'Sign in'}
        </Button>

        {/* show destiatnion hint */}
        {redirectTo && (
          <p className='text-center text-xs text-[hsl(var(--muted-foreground))]'>
            You'll be redirected to you destination after signing in.
          </p>
        )}
      </form>
    </AuthCard>
  )
}

export default LoginPage;
