'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { bloomUtilityClasses } from '@/lib/design-system';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-margin py-space-xl">
      <div className="w-full max-w-md">
        <div className="text-center mb-space-xl">
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-space-sm">
            Reset your password
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-space-xl shadow-md">
          {error && (
            <div className="mb-space-md p-space-md rounded-DEFAULT bg-error-container text-error font-body-sm text-body-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-space-md p-space-md rounded-DEFAULT bg-tertiary-container text-tertiary font-body-sm text-body-sm">
              Password reset email sent! Check your inbox.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-space-lg">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-space-sm">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={bloomUtilityClasses.input}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={bloomUtilityClasses.buttonPrimary + ' w-full justify-center'}
              disabled={loading || success}
            >
              {loading ? 'Sending...' : success ? 'Email sent' : 'Send reset link'}
            </button>
          </form>
        </div>

        <p className="mt-space-lg text-center font-body-md text-body-md text-on-surface-variant">
          Remember your password?{' '}
          <Link href="/login" className="text-primary hover:text-primary-container font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}