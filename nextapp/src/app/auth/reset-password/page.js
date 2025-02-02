'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Use useSearchParams to get query parameters
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get searchParams from the hook
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unwrap searchParams to get the token and email
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    // If either token or email is missing, show an error and redirect
    if (!token || !email) {
      toast.error('Invalid or expired link.');
      router.push('/auth/forgot-password');
    }
  }, [token, email, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Start submission process
    setIsSubmitting(true);
    toast.loading('Resetting password...', { id: 'reset-password' });

    try {
      const res = await axios.post(
        '/api/auth/reset-password',
        { email, token, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (res?.data?.success) {
        toast.success('Password reset successfully! Redirecting to login...', {
          id: 'reset-password',
        });
        setPassword('');
        setTimeout(() => router.push('/auth/login'), 3000);
      } else {
        toast.error(res?.data?.message || 'Something went wrong.', {
          id: 'reset-password',
        });
      }
    } catch (err) {
      toast.error('Failed to reset password.', { id: 'reset-password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">
          Reset Password
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Enter your new password below.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              placeholder="Enter your new password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 font-semibold rounded-lg shadow-md text-white ${
              isSubmitting
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75'
            }`}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
