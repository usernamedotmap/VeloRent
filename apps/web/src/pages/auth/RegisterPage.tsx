import AuthCard from '@/components/common/AuthCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constant/routes';
import { useRegister } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterInput, RegisterSchema } from '@velorent/shared';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { mutate: register, isPending, error, isSuccess } = useRegister();

  const { register: registerField, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = (data: RegisterInput) => register(data, {
    onSuccess: () => {
      navigate(
        redirectTo
        ? `${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectTo)}`
        : ROUTES.LOGIN
      )
    }
  });

  const apiError = (error as any)?.response?.data?.error?.message;

  return (
    <AuthCard
      title="Create your account"
      description="Join VeloRent and start riding green today"
      footer={
        <span>
          Already have an account?{' '}
          <Link
            to={ROUTES.LOGIN}
            className='"text-[hsl(var(--primary))] font-semibold hover:underline'>
            Sign in
          </Link>
        </span>
      }>
      {isSuccess ? (
        // success state
        <div className='text-center py-6'>
          <div className='text-5xl mb-4'>🎉</div>
          <h3 className='text-lg font-bold text-[hsl(var(--foreground))] mb-2'>
            Account created!
          </h3>
          <p className='text-sm text-[hsl(var(--muted-foreground))] mb-6'>
            Your account has been created successfully.
            Please sign in to continue.
          </p>
          <Link to={ROUTES.LOGIN}>
            <Button fullWidth>Go to Sign In</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
          {/* API error */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <span>⚠</span>
              {apiError}
            </div>
          )}

          {/* name */}
          <div className='grid grid-cols-2 gap-3'>
            <Input
              label='First name'
              placeholder='Baby'
              autoComplete='given-name'
              required
              error={errors.firstName?.message}
              {...registerField('firstName')}
            />
            <Input
              label='Last name'
              placeholder='M aq'
              autoComplete='family-name'
              required
              error={errors.lastName?.message}
              {...registerField('lastName')}
            />
          </div>

          {/* email */}
          <Input
            label='Email address'
            type='email'
            placeholder='baby@email.com'
            autoComplete='email'
            required
            error={errors.email?.message}
          />

          {/* phone */}
          <Input
            label="Phone number"
            type='tel'
            placeholder='09123456789'
            autoComplete='tel'
            required
            hint='Philippine mobile number (09XXXXXXXXX)'
            error={errors.phone?.message}
            {...registerField('phone')}
          />

          {/* passwword */}
          <div className='relative'>
            <Input
              label='Password'
              type={showPassword ? 'text' : 'password'}
              placeholder='*********'
              autoComplete='new-password'
              required
              hint='Must include uppercase, lowercase, and a number'
              error={errors.password?.message}
              {...registerField('password')}
            />
            <button type='button' onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-9 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors'>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* terms */}
          <p className='text-xs text-[hsl(var(--muted-foreground))] text-center px-2'>
            By creating an account you agree to out{' '}
            <span className='text-[hsl(var(--primary))] cursor-pointer hover:underline'>
              Terms of Service
            </span>{' '}
            and {' '}
            <span className="text-[hsl(var(--primary))] cursor-pointer hover:underline">
              Privacy Policy
            </span>
          </p>

          {/* submit */}
          <Button
            type='submit'
            fullWidth
            size='lg'
            loading={isPending}>
            {isPending ? 'Creating account...' : 'Create free account'}
          </Button>

        </form>
      )}
    </AuthCard>
  )
}

export default RegisterPage;
