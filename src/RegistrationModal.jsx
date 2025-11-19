import React, { useState } from 'react';
import { X, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const RegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    countryCode: 'US'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  if (!isOpen) return null;

  const countryCodes = [
    { code: 'US', name: 'US', flag: '🇺🇸', dial: '+1' },
    { code: 'IN', name: 'India', flag: '🇮🇳', dial: '+91' },
    { code: 'GB', name: 'UK', flag: '🇬🇧', dial: '+44' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', dial: '+1' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', dial: '+61' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      setError('Please enter your full name (minimum 2 characters)');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone_number: formData.phoneNumber,
          country_code: formData.countryCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(data.message);
      setShowVerificationMessage(true);
      
      localStorage.setItem('pendingVerification', JSON.stringify({
        userId: data.user_id,
        email: formData.email
      }));

      setTimeout(() => {
        onSuccess(data);
      }, 3000);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Verification email sent! Please check your inbox.');
      } else {
        setError(data.error || 'Failed to resend email');
      }
    } catch (err) {
      setError('Failed to resend verification email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        maxWidth: '440px',
        width: '100%',
        padding: '2rem',
        position: 'relative',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '0.5rem'
          }}
        >
          <X size={24} />
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎉</div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Unlock Your Imagination
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            You've reached your 3 free generations. Enter your details to keep creating unlimited, stunning designs.
          </p>
        </div>

        {showVerificationMessage ? (
          <div>
            <div style={{
              padding: '1rem',
              background: '#ecfdf5',
              border: '2px solid #10b981',
              borderRadius: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <CheckCircle size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ color: '#047857', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Registration Successful!
                  </p>
                  <p style={{ color: '#065f46', fontSize: '0.875rem' }}>
                    We've sent a verification email to <strong>{formData.email}</strong>. 
                    Please check your inbox and click the verification link to continue.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleResendVerification}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                color: '#6b7280',
                fontWeight: '500',
                cursor: 'pointer',
                marginBottom: '0.5rem'
              }}
            >
              {isSubmitting ? 'Sending...' : 'Resend Verification Email'}
            </button>

            <p style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              textAlign: 'center',
              marginTop: '1rem'
            }}>
              Didn't receive the email? Check your spam folder or click resend above.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter fullname"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#9333ea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#9333ea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Phone Number
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    cursor: 'pointer',
                    width: '100px'
                  }}
                >
                  {countryCodes.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.dial}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#9333ea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {error && (
              <div style={{
                padding: '0.75rem',
                background: '#fef2f2',
                border: '1px solid #ef4444',
                borderRadius: '0.5rem',
                color: '#dc2626',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && !showVerificationMessage && (
              <div style={{
                padding: '0.75rem',
                background: '#ecfdf5',
                border: '1px solid #10b981',
                borderRadius: '0.5rem',
                color: '#047857',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle size={16} />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                background: isSubmitting ? '#d1d5db' : 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                color: 'white',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '1rem',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Registering...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Design
                </>
              )}
            </button>

            <p style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              textAlign: 'center',
              marginTop: '1rem'
            }}>
              We respect your privacy. Your information is secure and will never be shared.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegistrationModal;