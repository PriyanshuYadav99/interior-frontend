import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Home } from 'lucide-react';

const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        
        localStorage.setItem('isVerified', 'true');
        localStorage.setItem('userEmail', data.user.email);
        localStorage.removeItem('pendingVerification');
        localStorage.removeItem('generationCount');

        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to verify email. Please try again.');
      console.error('Verification error:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 50%, #eff6ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: '3rem',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        {status === 'verifying' && (
          <>
            <Loader2
              size={64}
              color="#9333ea"
              style={{ 
                margin: '0 auto 1.5rem',
                animation: 'spin 1s linear infinite'
              }}
            />
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Verifying Your Email
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#ecfdf5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <CheckCircle size={48} color="#10b981" />
            </div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Email Verified! 🎉
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '2rem' }}>
              {message}
            </p>
            <div style={{
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '0.75rem',
              marginBottom: '2rem'
            }}>
              <p style={{
                color: '#374151',
                fontSize: '0.875rem',
                marginBottom: '0.5rem'
              }}>
                ✨ You now have unlimited design generations!
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                Redirecting you to the app in a few seconds...
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <Home size={20} />
              Go to App
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <XCircle size={48} color="#ef4444" />
            </div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Verification Failed
            </h1>
            <p style={{ color: '#dc2626', fontSize: '1rem', marginBottom: '2rem' }}>
              {message}
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'white',
                color: '#111827',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                border: '2px solid #e5e7eb',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Home size={20} />
              Go Back
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VerifyPage;