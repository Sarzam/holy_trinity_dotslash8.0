'use client'; // Mark this as a Client Component

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');

    if (token && email) {
      const verifyEmail = async () => {
        try {
          const response = await fetch(
            `/api/auth/verify-email/?token=${token}&email=${email}`,
            {
              method: 'GET',
            }
          );

          if (response.ok) {
            toast.success('Email verified successfully! Redirecting to login...');
            setTimeout(() => router.push('/auth/login'), 3000); // Redirect to login
          } else {
            const errorData = await response.json();
            toast.error(errorData.message || 'Verification failed.');
          }
        } catch (error) {
          toast.error('An error occurred during verification. Please try again.');
        }
      };

      verifyEmail();
    } else {
      toast.error('Invalid verification link.');
    }
  }, [router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Email Verification</h1>
      <p>Processing your request...</p>
    </div>
  );
};

export default VerifyEmail;
