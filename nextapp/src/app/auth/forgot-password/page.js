'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Start submission process
    setIsSubmitting(true);
    toast.loading('Sending reset link...', { id: 'forgot-password' });

    try {
      const res = await axios.post(
        '/api/auth/forgot-password',
        {email},
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
      )

      if (res?.data?.success) {
        setEmail('')
        toast.success('Password reset email sent. Check your inbox.', { id: 'forgot-password' });
      } else {
        const data = await res.json();
        toast.error(res?.data?.message || 'Something went wrong.', { id: 'forgot-password' });
      }
    } catch (err) {
      toast.error('Failed to send reset email.', { id: 'forgot-password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">Forgot Password</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Enter your email, and we'll send you a password reset link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              placeholder="Enter your email"
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
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
