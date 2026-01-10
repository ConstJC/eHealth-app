'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4081/api/v1';

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const token = searchParams.get('token');

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await axios.get(`${BACKEND_API_URL}/auth/verify-email`, {
        params: { token: verificationToken },
      });
      setStatus('success');
      setMessage(response.data.message || 'Email verified successfully!');
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 3000      );
    } catch (err: unknown) {
      setStatus('error');
      setMessage(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          'Email verification failed. The link may have expired. Please request a new verification email.'
      );
    }
  };

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Verification token is missing. Please check your email for the correct link.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (status === 'loading') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verifying your email</CardTitle>
          <CardDescription>Please wait while we verify your email address...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {status === 'success' ? 'Email verified!' : 'Verification failed'}
        </CardTitle>
        <CardDescription>
          {status === 'success'
            ? 'Your email has been successfully verified.'
            : 'We were unable to verify your email address.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant={status === 'success' ? 'success' : 'error'}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
        {status === 'success' && (
          <p className="mt-4 text-sm text-gray-600">
            Redirecting to login page in a few seconds...
          </p>
        )}
        <div className="mt-6 text-center">
          <Button
            onClick={() => router.push(status === 'success' ? ROUTES.LOGIN : ROUTES.REGISTER)}
            className="w-full"
          >
            {status === 'success' ? 'Go to login' : 'Back to registration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

