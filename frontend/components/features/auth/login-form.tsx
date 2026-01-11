'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Activity, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/lib/constants';

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const result = await response.json();
      await login(result);
      
      router.push('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="w-full">
      {/* Branding Section */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-2 shadow-sm ring-1 ring-primary/20">
          <Activity className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access the EMR
        </p>
      </div>

      {/* Login Form Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 flex items-center border border-red-100 animate-in fade-in slide-in-from-top-1">
              <AlertTriangle className="h-4 w-4 mr-2 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-600 font-semibold ml-1">Email</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="doctor@clinic.com"
                {...register('email')}
                disabled={isLoading}
                className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl transition-all focus:bg-white focus:ring-4 focus:ring-primary/10"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive font-medium ml-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="password" className="text-slate-600 font-semibold">Password</Label>
              <a href={ROUTES.FORGOT_PASSWORD} className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
                className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 rounded-xl transition-all focus:bg-white focus:ring-4 focus:ring-primary/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive font-medium ml-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 font-bold text-lg rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Sign In'}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-xs text-muted-foreground">
          Protected by industry standard encryption. <br/>
          ©2026 eHealth System.
        </p>
      </div>
    </div>
  );
}

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
  )
}
