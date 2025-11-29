// import React, { useState, useEffect } from 'react';
// import { X, Loader2, CheckCircle, AlertCircle, Mail, Phone, User, MessageSquare, Lock } from 'lucide-react';

// const RegistrationModal = ({ isOpen, onClose, onSuccess, generatedCount = 0 }) => {
//   const [step, setStep] = useState(1); // 1 = form, 2 = OTP input
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
  
//   // Form data
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [countryCode, setCountryCode] = useState('IN');
//   const [otp, setOtp] = useState('');
  
//   // OTP state
//   const [otpSent, setOtpSent] = useState(false);
//   const [canResend, setCanResend] = useState(false);
//   const [resendTimer, setResendTimer] = useState(60);
//   const [userId, setUserId] = useState(null);
  
//   // STRICT: Prevent closing modal without verification
//   const [canClose, setCanClose] = useState(false);

//   useEffect(() => {
//     if (!isOpen) {
//       setStep(1);
//       setFullName('');
//       setEmail('');
//       setPhoneNumber('');
//       setOtp('');
//       setError('');
//       setSuccess('');
//       setOtpSent(false);
//       setCanClose(false);
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     if (otpSent && resendTimer > 0) {
//       const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
//       return () => clearTimeout(timer);
//     } else if (resendTimer === 0) {
//       setCanResend(true);
//     }
//   }, [otpSent, resendTimer]);

//   const handleClose = () => {
//     if (canClose) {
//       onClose();
//     } else {
//       setError('⚠️ You must complete registration to continue generating images');
//       setTimeout(() => setError(''), 3000);
//     }
//   };

//   const handleSubmit = async () => {
//     setError('');
//     setSuccess('');
//     setLoading(true);

//     if (!fullName.trim() || fullName.length < 2) {
//       setError('Please enter your full name (minimum 2 characters)');
//       setLoading(false);
//       return;
//     }

//     if (!phoneNumber || phoneNumber.length < 10) {
//       setError('Please enter a valid phone number');
//       setLoading(false);
//       return;
//     }

//     if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       setError('Please enter a valid email address');
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch('http://localhost:5000/api/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           full_name: fullName,
//           email: email || null,
//           phone_number: phoneNumber,
//           country_code: countryCode,
//           session_id: localStorage.getItem('sessionId') || 'web-' + Date.now(),
//           generated_count: generatedCount
//         })
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setOtpSent(true);
//         setUserId(data.user_id);
//         setStep(2);
        
//         if (email) {
//           setSuccess(`✅ OTP sent to ${phoneNumber}! Also check ${email} for your generation info.`);
//         } else {
//           setSuccess(`✅ OTP sent to ${phoneNumber}!`);
//         }
        
//         setResendTimer(60);
//         setCanResend(false);
        
//         localStorage.setItem('pendingVerification', JSON.stringify({ 
//   email: email || null, 
//   phone: phoneNumber, // ✅ Make sure 'phone' key exists
//   userId: data.user_id 
// }));
//       } else {
//         setError(data.error || 'Registration failed. Please try again.');
//       }
//     } catch (error) {
//       console.error('Registration error:', error);
//       setError('❌ Failed to send OTP. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOTP = async () => {
//     setError('');
//     setSuccess('');
//     setLoading(true);

//     if (otp.length !== 6) {
//       setError('Please enter a valid 6-digit OTP');
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch('http://localhost:5000/api/verify-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email: email || null,
//           phone_number: phoneNumber,
//           otp: otp,
//           session_id: localStorage.getItem('sessionId') || 'web-' + Date.now()
//         })
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//   setSuccess('🎉 Verified! You can now generate unlimited designs.');
//   setCanClose(true);
  
//   localStorage.setItem('isVerified', 'true');
//   localStorage.setItem('userPhone', phoneNumber);
//   if (email) localStorage.setItem('userEmail', email);
//   localStorage.setItem('userId', data.user_id);
//   sessionStorage.removeItem('generationCount'); // ✅ CHANGE: sessionStorage
//   localStorage.removeItem('pendingVerification');
  
//   setTimeout(() => {
//     onSuccess({ 
//       verified: true, 
//       email: email || null, 
//       phone: phoneNumber,
//       user_id: data.user_id 
//     });
//     onClose();
//   }, 2000);
// } else {
//         setError(data.error || '❌ Invalid OTP. Please check and try again.');
//       }
//     } catch (error) {
//       console.error('OTP verification error:', error);
//       setError('❌ Verification failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     setError('');
//     setSuccess('');
//     setLoading(true);

//     try {
//       const response = await fetch('http://localhost:5000/api/resend-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           email: email || null,
//           phone_number: phoneNumber 
//         })
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         setSuccess('✅ New OTP sent to your phone!');
//         setResendTimer(60);
//         setCanResend(false);
//       } else {
//         setError(data.error || 'Failed to resend OTP');
//       }
//     } catch (error) {
//       console.error('Resend OTP error:', error);
//       setError('Failed to resend OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div style={{
//       position: 'fixed',
//       inset: 0,
//       background: 'rgba(0, 0, 0, 0.7)',
//       backdropFilter: 'blur(4px)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       zIndex: 9999,
//       padding: '1rem'
//     }}>
//       <div style={{
//         background: 'white',
//         borderRadius: '1rem',
//         boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
//         width: '100%',
//         maxWidth: '450px',
//         position: 'relative',
//         animation: 'slideIn 0.3s ease-out'
//       }}>
//         {/* Header */}
//         <div style={{
//           padding: '1.5rem',
//           borderBottom: '1px solid #e5e7eb',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <div>
//             <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
//               {step === 1 ? '🎨 Continue Creating' : '📱 Verify Your Phone'}
//             </h2>
//             <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
//               {step === 1 
//                 ? `You've used your 2 free generations. Register to unlock unlimited designs!`
//                 : `Enter the 6-digit code sent to ${phoneNumber}`
//               }
//             </p>
//           </div>
//           <button
//             onClick={handleClose}
//             style={{
//               background: 'none',
//               border: 'none',
//               cursor: 'pointer',
//               padding: '0.5rem',
//               color: canClose ? '#9ca3af' : '#d1d5db',
//               position: 'relative'
//             }}
//             title={!canClose ? 'Complete registration to close' : 'Close'}
//           >
//             {!canClose && (
//               <Lock size={12} style={{ position: 'absolute', top: '2px', right: '2px', color: '#ef4444' }} />
//             )}
//             <X size={24} />
//           </button>
//         </div>

//         {/* Body */}
//         <div style={{ padding: '1.5rem' }}>
//           {step === 1 ? (
//             // Step 1: Registration
//             <div>
//               <div style={{
//                 marginBottom: '1.5rem',
//                 padding: '1rem',
//                 background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
//                 border: '2px solid #f59e0b',
//                 borderRadius: '0.75rem',
//                 textAlign: 'center'
//               }}>
//                 <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0, fontWeight: '600' }}>
//                   🔒 <strong>{generatedCount}/2 Free Generations Used</strong>
//                 </p>
//                 <p style={{ fontSize: '0.75rem', color: '#b45309', margin: '0.5rem 0 0', fontWeight: '500' }}>
//                   Complete registration to unlock unlimited access!
//                 </p>
//               </div>

//               <div style={{ marginBottom: '1rem' }}>
//                 <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
//                   <User size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
//                   Full Name <span style={{ color: '#ef4444' }}>*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   placeholder="NAME"
//                   style={{
//                     width: '100%',
//                     padding: '0.75rem',
//                     border: '2px solid #e5e7eb',
//                     borderRadius: '0.5rem',
//                     fontSize: '1rem',
//                     outline: 'none'
//                   }}
//                   onFocus={(e) => e.target.style.borderColor = '#9333ea'}
//                   onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
//                 />
//               </div>

//               <div style={{ marginBottom: '1rem' }}>
//                 <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
//                   <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
//                   Email <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>(Optional)</span>
//                 </label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="john@example.com (optional)"
//                   style={{
//                     width: '100%',
//                     padding: '0.75rem',
//                     border: '2px solid #e5e7eb',
//                     borderRadius: '0.5rem',
//                     fontSize: '1rem',
//                     outline: 'none'
//                   }}
//                   onFocus={(e) => e.target.style.borderColor = '#9333ea'}
//                   onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
//                 />
//                 <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
//                   💡 Add email to receive updates about your generated images
//                 </p>
//               </div>

//               <div style={{ marginBottom: '1.5rem' }}>
//                 <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
//                   <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
//                   Phone Number <span style={{ color: '#ef4444' }}>*</span>
//                 </label>
//                 <div style={{ display: 'flex', gap: '0.5rem' }}>
//                   <select
//                     value={countryCode}
//                     onChange={(e) => setCountryCode(e.target.value)}
//                     style={{
//                       padding: '0.75rem',
//                       border: '2px solid #e5e7eb',
//                       borderRadius: '0.5rem',
//                       fontSize: '1rem',
//                       background: 'white',
//                       cursor: 'pointer',
//                       minWidth: '100px'
//                     }}
//                   >
//                     <option value="IN">🇮🇳 +91</option>
//                     <option value="US">🇺🇸 +1</option>
//                     <option value="GB">🇬🇧 +44</option>
//                     <option value="CA">🇨🇦 +1</option>
//                     <option value="AU">🇦🇺 +61</option>
//                   </select>
//                   <input
//                     type="tel"
//                     value={phoneNumber}
//                     onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
//                     placeholder="PhoneNumber"
//                     maxLength={10}
//                     style={{
//                       flex: 1,
//                       padding: '0.75rem',
//                       border: '2px solid #e5e7eb',
//                       borderRadius: '0.5rem',
//                       fontSize: '1rem',
//                       outline: 'none'
//                     }}
//                     onFocus={(e) => e.target.style.borderColor = '#9333ea'}
//                     onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
//                   />
//                 </div>
//               </div>

//               {error && (
//                 <div style={{
//                   marginBottom: '1rem',
//                   padding: '0.75rem',
//                   background: '#fef2f2',
//                   border: '1px solid #fecaca',
//                   borderRadius: '0.5rem',
//                   color: '#dc2626',
//                   fontSize: '0.875rem',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '0.5rem'
//                 }}>
//                   <AlertCircle size={16} />
//                   {error}
//                 </div>
//               )}

//               {success && (
//                 <div style={{
//                   marginBottom: '1rem',
//                   padding: '0.75rem',
//                   background: '#ecfdf5',
//                   border: '1px solid #6ee7b7',
//                   borderRadius: '0.5rem',
//                   color: '#047857',
//                   fontSize: '0.875rem',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '0.5rem'
//                 }}>
//                   <CheckCircle size={16} />
//                   {success}
//                 </div>
//               )}

//               <button
//                 onClick={handleSubmit}
//                 disabled={loading || !fullName || !phoneNumber}
//                 style={{
//                   width: '100%',
//                   background: (loading || !fullName || !phoneNumber) ? '#d1d5db' : 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
//                   color: 'white',
//                   padding: '1rem',
//                   borderRadius: '0.5rem',
//                   fontWeight: '600',
//                   fontSize: '1rem',
//                   border: 'none',
//                   cursor: (loading || !fullName || !phoneNumber) ? 'not-allowed' : 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '0.5rem'
//                 }}
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
//                     Sending OTP...
//                   </>
//                 ) : (
//                   <>
//                     <MessageSquare size={20} />
//                     Send OTP & Continue
//                   </>
//                 )}
//               </button>

//               <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
//                 🔒 We respect your privacy. Your information is secure.
//               </p>
//             </div>
//           ) : (
//             // Step 2: OTP Verification
//             <div>
//               <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
//                 <div style={{
//                   width: '80px',
//                   height: '80px',
//                   background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
//                   borderRadius: '50%',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   margin: '0 auto 1rem'
//                 }}>
//                   <Phone size={40} color="#9333ea" />
//                 </div>
//                 <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
//                   We've sent a verification code to<br />
//                   <strong style={{ color: '#111827' }}>{phoneNumber}</strong>
//                 </p>
//                 {email && (
//                   <p style={{ color: '#9333ea', fontSize: '0.875rem', marginTop: '0.5rem' }}>
//                     📧 Check <strong>{email}</strong> for generation info!
//                   </p>
//                 )}
//               </div>

//               <div style={{ marginBottom: '1.5rem' }}>
//                 <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', textAlign: 'center' }}>
//                   Enter 6-Digit OTP
//                 </label>
//                 <input
//                   type="text"
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                   placeholder="000000"
//                   maxLength={6}
//                   style={{
//                     width: '100%',
//                     padding: '1rem',
//                     border: '2px solid #e5e7eb',
//                     borderRadius: '0.5rem',
//                     fontSize: '1.75rem',
//                     textAlign: 'center',
//                     letterSpacing: '0.75rem',
//                     fontWeight: '700',
//                     outline: 'none'
//                   }}
//                   onFocus={(e) => e.target.style.borderColor = '#9333ea'}
//                   onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
//                 />
//               </div>

//               {error && (
//                 <div style={{
//                   marginBottom: '1rem',
//                   padding: '0.75rem',
//                   background: '#fef2f2',
//                   border: '1px solid #fecaca',
//                   borderRadius: '0.5rem',
//                   color: '#dc2626',
//                   fontSize: '0.875rem',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '0.5rem'
//                 }}>
//                   <AlertCircle size={16} />
//                   {error}
//                 </div>
//               )}

//               {success && (
//                 <div style={{
//                   marginBottom: '1rem',
//                   padding: '0.75rem',
//                   background: '#ecfdf5',
//                   border: '1px solid #6ee7b7',
//                   borderRadius: '0.5rem',
//                   color: '#047857',
//                   fontSize: '0.875rem',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '0.5rem'
//                 }}>
//                   <CheckCircle size={16} />
//                   {success}
//                 </div>
//               )}

//               <button
//                 onClick={handleVerifyOTP}
//                 disabled={loading || otp.length !== 6}
//                 style={{
//                   width: '100%',
//                   background: (loading || otp.length !== 6) ? '#d1d5db' : 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
//                   color: 'white',
//                   padding: '1rem',
//                   borderRadius: '0.5rem',
//                   fontWeight: '600',
//                   fontSize: '1rem',
//                   border: 'none',
//                   cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '0.5rem',
//                   marginBottom: '1rem'
//                 }}
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
//                     Verifying...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle size={20} />
//                     Verify & Start Creating
//                   </>
//                 )}
//               </button>

//               <div style={{ textAlign: 'center' }}>
//                 {canResend ? (
//                   <button
//                     onClick={handleResendOTP}
//                     disabled={loading}
//                     style={{
//                       background: 'none',
//                       border: 'none',
//                       color: '#9333ea',
//                       fontSize: '0.875rem',
//                       fontWeight: '600',
//                       cursor: 'pointer',
//                       textDecoration: 'underline'
//                     }}
//                   >
//                     Resend OTP
//                   </button>
//                 ) : (
//                   <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
//                     Resend OTP in {resendTimer}s
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       <style>{`
//         @keyframes slideIn {
//           from {
//             opacity: 0;
//             transform: translateY(-20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default RegistrationModal;
import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Mail, Phone, User } from 'lucide-react';

// ✅ FIXED: Use Railway URL instead of localhost
const API_BASE_URL = 'https://interior-backend-production.up.railway.app';

const RegistrationModal = ({ isOpen, onClose, onSuccess, generatedCount = 0, sessionId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('IN');

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFullName('');
      setEmail('');
      setPhoneNumber('');
      setCountryCode('IN');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleClose = () => {
    // ✅ BLOCK CLOSING - User must complete registration
    setError('⚠️ Please complete registration to continue generating images');
    setTimeout(() => setError(''), 3000);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    // ✅ VALIDATION
    if (!fullName.trim() || fullName.length < 2) {
      setError('Please enter your full name (minimum 2 characters)');
      setLoading(false);
      return;
    }

    // ✅ EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // ✅ PHONE VALIDATION
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number (10 digits minimum)');
      setLoading(false);
      return;
    }

    try {
      console.log('[MODAL] Submitting registration...');
      console.log('[MODAL] Using API URL:', `${API_BASE_URL}/api/simple-register`);
      
      // ✅ FIXED: Use Railway URL
      const response = await fetch(`${API_BASE_URL}/api/simple-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone_number: phoneNumber.trim(),
          country_code: countryCode,
          session_id: sessionId,
          generated_count: generatedCount
        })
      });

      console.log('[MODAL] Response status:', response.status);

      const data = await response.json();
      console.log('[MODAL] Response data:', data);

      if (response.ok && data.success) {
        console.log('[MODAL] Registration successful!', data);
        
        setSuccess('🎉 Registration complete! Redirecting...');
        
        // ✅ WAIT 1.5 SECONDS TO SHOW SUCCESS MESSAGE
        setTimeout(() => {
          onSuccess({
            user_id: data.user_id,
            name: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phoneNumber.trim(),
            registered: true
          });
        }, 1500);
        
      } else {
        console.error('[MODAL] Registration failed:', data);
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('[MODAL] Registration error:', error);
      setError('❌ Failed to register. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
        width: '100%',
        maxWidth: '450px',
        position: 'relative',
        animation: 'slideIn 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
              🎨 Register to Continue
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              You've used your 2 free generations. Register to unlock unlimited designs!
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: '#d1d5db',
              opacity: 0.5
            }}
            title="Complete registration to close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Alert Banner */}
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '2px solid #f59e0b',
            borderRadius: '0.75rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0, fontWeight: '600' }}>
              🔒 <strong>2/2 Free Generations Used</strong>
            </p>
            <p style={{ fontSize: '0.75rem', color: '#b45309', margin: '0.5rem 0 0', fontWeight: '500' }}>
              Complete registration below to unlock unlimited access!
            </p>
          </div>

          {/* Full Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              <User size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              disabled={loading || success}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                opacity: loading || success ? 0.6 : 1
              }}
              onFocus={(e) => e.target.style.borderColor = '#9333ea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Email <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              disabled={loading || success}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                opacity: loading || success ? 0.6 : 1
              }}
              onFocus={(e) => e.target.style.borderColor = '#9333ea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              💡 We'll send you a welcome email
            </p>
          </div>

          {/* Phone Number */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Phone Number <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                disabled={loading || success}
                style={{
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  background: 'white',
                  cursor: 'pointer',
                  minWidth: '100px',
                  opacity: loading || success ? 0.6 : 1
                }}
              >
                <option value="IN">🇮🇳 +91</option>
                <option value="US">🇺🇸 +1</option>
                <option value="GB">🇬🇧 +44</option>
                <option value="CA">🇨🇦 +1</option>
                <option value="AU">🇦🇺 +61</option>
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="1234567890"
                maxLength={15}
                disabled={loading || success}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  opacity: loading || success ? 0.6 : 1
                }}
                onFocus={(e) => e.target.style.borderColor = '#9333ea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              color: '#dc2626',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              background: '#ecfdf5',
              border: '1px solid #6ee7b7',
              borderRadius: '0.5rem',
              color: '#047857',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || success || !fullName.trim() || !email.trim() || !phoneNumber}
            style={{
              width: '100%',
              background: (loading || success || !fullName.trim() || !email.trim() || !phoneNumber) 
                ? '#d1d5db' 
                : 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              border: 'none',
              cursor: (loading || success || !fullName.trim() || !email.trim() || !phoneNumber) 
                ? 'not-allowed' 
                : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: (loading || success || !fullName.trim() || !email.trim() || !phoneNumber) 
                ? 'none' 
                : '0 4px 6px rgba(147, 51, 234, 0.3)'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Registering...
              </>
            ) : success ? (
              <>
                <CheckCircle size={20} />
                Success!
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Register & Start Creating
              </>
            )}
          </button>

          <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
            🔒 Your information is secure and will never be shared
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RegistrationModal;