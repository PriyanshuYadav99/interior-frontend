// import React, { useState, useEffect } from 'react';
// import { Sparkles, Download, Home, Bed, Utensils, Bath, Briefcase, UtensilsCrossed, Loader2, AlertCircle, CheckCircle, SofaIcon } from 'lucide-react';
// import { generateDesign, checkHealth, checkSession, incrementGeneration } from './api';
// import RegistrationModal from './RegistrationModal';
// import './App.css';

// const App = () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const clientName = urlParams.get('client') || 'skyline';
//   const [selectedRoom, setSelectedRoom] = useState('');
//   const [selectedStyle, setSelectedStyle] = useState('');
//   const [customPrompt, setCustomPrompt] = useState('');
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generatedImages, setGeneratedImages] = useState([]);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [apiStatus, setApiStatus] = useState('checking');
  
//   // Registration state
//   const [showRegistrationModal, setShowRegistrationModal] = useState(false);
//   const [generationCount, setGenerationCount] = useState(0);
//   const [isRegistered, setIsRegistered] = useState(false);
//   const [userEmail, setUserEmail] = useState('');
//   const [sessionId, setSessionId] = useState('');

//   const rooms = [
//     { id: 'master_bedroom', name: 'Master Bedroom', icon: Bed },
//     { id: 'bedroom_1', name: 'Bedroom 1', icon: Bed },
//     { id: 'bedroom_2', name: 'Bedroom 2', icon: Bed },
//     { id: 'living_room', name: 'Living Room', icon: SofaIcon },
//     { id: 'kitchen', name: 'Kitchen', icon: Briefcase },
//     { id: 'dining_room', name: 'Dining Room', icon: UtensilsCrossed }
//   ];

//   const styles = [
//     { id: 'modern', name: 'Modern' },
//     { id: 'scandinavian', name: 'Scandinavian' },
//     { id: 'industrial', name: 'Industrial' },
//     { id: 'minimalist', name: 'Minimalist' },
//     { id: 'traditional', name: 'Traditional' },
//     { id: 'bohemian', name: 'Bohemian' }
//   ];

//   useEffect(() => {
//     const checkApiHealth = async () => {
//       try {
//         const health = await checkHealth();
//         setApiStatus(health.status === 'healthy' ? 'connected' : 'disconnected');
//       } catch (error) {
//         setApiStatus('disconnected');
//       }
//     };
//     checkApiHealth();

//     // Generate or retrieve session ID
//     let currentSessionId = localStorage.getItem('sessionId');
//     if (!currentSessionId) {
//       currentSessionId = 'web-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
//       localStorage.setItem('sessionId', currentSessionId);
//     }
//     setSessionId(currentSessionId);

//     // ✅ CHECK REGISTRATION STATUS FROM LOCALSTORAGE
//     const registeredEmail = localStorage.getItem('userEmail');
//     const registeredName = localStorage.getItem('userName');
//     const registeredPhone = localStorage.getItem('userPhone');
    
//     if (registeredEmail && registeredName && registeredPhone) {
//       // User is registered - unlock unlimited access
//       setIsRegistered(true);
//       setUserEmail(registeredEmail);
//       setGenerationCount(0); // Reset count for registered users
//       console.log('[APP] User is registered:', registeredEmail);
//     } else {
//       // Not registered - check generation count from server
//       checkServerGenerationCount(currentSessionId);
//     }
//   }, []);

//   const checkServerGenerationCount = async (sessionId) => {
//     try {
//       const data = await checkSession(sessionId);
      
//       if (data.success) {
//         const count = data.generation_count || 0;
//         setGenerationCount(count);
//         console.log('[APP] Current generation count:', count);
        
//         // If they're registered on server, sync to frontend
//         if (data.is_registered) {
//           setIsRegistered(true);
//           setUserEmail(data.email || '');
//           localStorage.setItem('userEmail', data.email || '');
//         }
//       }
//     } catch (error) {
//       console.error('[APP] Error checking session:', error);
//       // Fallback to localStorage
//       const localCount = parseInt(localStorage.getItem('generationCount') || '0', 10);
//       setGenerationCount(localCount);
//     }
//   };

//   const handleGenerate = async () => {
//     if (!selectedRoom) {
//       setError('Please select a room type');
//       return;
//     }

//     if (!selectedStyle && !customPrompt.trim()) {
//       setError('Please select a style or enter a custom prompt');
//       return;
//     }

//     // ✅ CHECK: If not registered and already used 2 generations, show modal BEFORE generating
//     if (!isRegistered && generationCount >= 2) {
//       console.log('[APP] Generation limit reached. Showing registration modal...');
//       setShowRegistrationModal(true);
//       setError('⚠️ You\'ve used your 2 free generations. Please register to continue.');
//       return; // STOP - Don't generate
//     }

//     // User can generate - proceed
//     await executeGeneration();
//   };

//   const executeGeneration = async () => {
//     setIsGenerating(true);
//     setError('');
//     setSuccess('');

//     try {
//       const result = await generateDesign(selectedRoom, selectedStyle, customPrompt, clientName);
      
//       if (result.success && result.images && result.images.length > 0) {
//         const processedImages = result.images.map((img, index) => ({
//           id: img.id || index,
//           url: `data:image/png;base64,${img.image_base64}`,
//           style: img.style,
//           roomType: img.room_type
//         }));
        
//         setGeneratedImages(processedImages);
//         setSuccess(`Successfully generated ${processedImages.length} design(s)!`);

//         // ✅ UPDATE GENERATION COUNT ONLY IF NOT REGISTERED
//         if (!isRegistered) {
//           const newCount = generationCount + 1;
//           setGenerationCount(newCount);
          
//           // Update localStorage
//           localStorage.setItem('generationCount', newCount.toString());
          
//           // Update server count using the API function
//           try {
//             await incrementGeneration(sessionId, selectedRoom, selectedStyle, customPrompt);
//           } catch (err) {
//             console.error('[APP] Error updating server count:', err);
//           }

//           console.log('[APP] Generation count updated:', newCount);
          
//           // ✅ SHOW MODAL AFTER 2ND GENERATION (when count becomes 2)
//           if (newCount >= 2) {
//             setTimeout(() => {
//               setShowRegistrationModal(true);
//               setError('⚠️ You\'ve used your 2 free generations. Register now to continue creating!');
//             }, 1000);
//           }
//         }
//       } else {
//         setError('No images were generated. Please try again.');
//       }
//     } catch (err) {
//       console.error('Generation error:', err);
//       setError(err.message || 'Failed to generate design. Please check your API configuration and try again.');
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const handleRegistrationSuccess = async (data) => {
//     console.log('[APP] Registration successful:', data);
    
//     // ✅ SAVE REGISTRATION DATA TO LOCALSTORAGE
//     localStorage.setItem('userEmail', data.email);
//     localStorage.setItem('userName', data.name);
//     localStorage.setItem('userPhone', data.phone);
//     localStorage.setItem('userId', data.user_id);
//     localStorage.removeItem('generationCount'); // Clear count
    
//     // ✅ UPDATE STATE
//     setIsRegistered(true);
//     setGenerationCount(0);
//     setUserEmail(data.email);
    
//     // ✅ CLOSE MODAL
//     setShowRegistrationModal(false);
    
//     // ✅ CLEAR ERROR AND SHOW SUCCESS
//     setError('');
//     setSuccess('🎉 Registration complete! You now have unlimited access.');
    
//     console.log('[APP] User registered and modal closed');
//   };

//   const downloadImage = (imageUrl, index) => {
//     const link = document.createElement('a');
//     link.href = imageUrl;
//     link.download = `design-${selectedRoom}-${index + 1}.png`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div style={{ height: '100vh', background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 50%, #eff6ff 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
//       {/* Compact Header */}
//       <div style={{ textAlign: 'center', padding: '1rem 2rem 0.5rem' }}>
//         <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem', margin: 0 }}>
//           Reimagine Your Property with AI
//         </h1>

        
//       </div>

//       {/* Main Content Area */}
//       <div style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '0.5rem 2rem 1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', overflow: 'hidden' }}>
//         {/* Left Panel - Scrollable */}
//         <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
//           <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
//             {/* Room Selection */}
//             <div style={{ marginBottom: '1.25rem' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
//                 <Home size={18} color="#374151" />
//                 <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>Select Room</h2>
//               </div>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
//                 {rooms.map((room) => {
//                   const Icon = room.icon;
//                   return (
//                     <button
//                       key={room.id}
//                       onClick={() => setSelectedRoom(room.id)}
//                       style={{
//                         padding: '0.625rem',
//                         borderRadius: '0.5rem',
//                         border: selectedRoom === room.id ? '2px solid #9333ea' : '2px solid #e5e7eb',
//                         background: selectedRoom === room.id ? '#faf5ff' : 'white',
//                         boxShadow: selectedRoom === room.id ? '0 4px 6px rgba(147,51,234,0.1)' : 'none',
//                         cursor: 'pointer',
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '0.5rem',
//                         transition: 'all 0.2s'
//                       }}
//                     >
//                       <Icon size={16} />
//                       <span style={{ fontWeight: '500', fontSize: '0.8rem' }}>{room.name}</span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Style Selection */}
//             <div style={{ marginBottom: '1.25rem' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
//                 <Sparkles size={18} color="#374151" />
//                 <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>Choose Style</h2>
//               </div>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
//                 {styles.map((style) => (
//                   <button
//                     key={style.id}
//                     onClick={() => {
//                       setSelectedStyle(style.id);
//                       setCustomPrompt('');
//                     }}
//                     style={{
//                       padding: '0.5rem',
//                       borderRadius: '0.5rem',
//                       border: selectedStyle === style.id ? '2px solid #9333ea' : '2px solid #e5e7eb',
//                       background: selectedStyle === style.id ? '#faf5ff' : 'white',
//                       boxShadow: selectedStyle === style.id ? '0 4px 6px rgba(147,51,234,0.1)' : 'none',
//                       cursor: 'pointer',
//                       transition: 'all 0.2s'
//                     }}
//                   >
//                     <span style={{ fontWeight: '500', fontSize: '0.8rem' }}>{style.name}</span>
//                   </button>
//                 ))}
//               </div>

//               <div style={{ textAlign: 'center', color: '#9ca3af', fontWeight: '500', margin: '0.5rem 0', fontSize: '0.75rem' }}>OR</div>

//               <textarea
//                 value={customPrompt}
//                 onChange={(e) => {
//                   setCustomPrompt(e.target.value);
//                   if (e.target.value.trim()) setSelectedStyle('');
//                 }}
//                 placeholder="Describe your style (e.g., Space theme kids room, Tropical paradise...)"
//                 style={{
//                   width: '100%',
//                   padding: '0.75rem',
//                   border: '2px solid #e5e7eb',
//                   borderRadius: '0.5rem',
//                   resize: 'none',
//                   height: '4rem',
//                   fontSize: '0.8rem',
//                   outline: 'none',
//                   transition: 'border 0.2s'
//                 }}
//                 onFocus={(e) => e.target.style.borderColor = '#9333ea'}
//                 onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
//               />
//             </div>

//             {/* Generate Button */}
//             <button
//               onClick={handleGenerate}
//               disabled={isGenerating || apiStatus === 'disconnected'}
//               style={{
//                 width: '100%',
//                 background: isGenerating || apiStatus === 'disconnected' ? '#d1d5db' : '#256D11',
//                 color: 'white',
//                 padding: '0.875rem',
//                 borderRadius: '0.5rem',
//                 fontWeight: '600',
//                 fontSize: '1rem',
//                 border: 'none',
//                 cursor: isGenerating || apiStatus === 'disconnected' ? 'not-allowed' : 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 gap: '0.5rem',
//                 boxShadow: '0 10px 15px rgba(37,109,17,0.3)',
//                 transition: 'all 0.2s',
//                 marginBottom: '3.5rem'
//               }}
//             >
//               {isGenerating ? (
//                 <>
//                   <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
//                   Generating Design...
//                 </>
//               ) : (
//                 <>
//                   <Sparkles size={18} />
//                   Generate Design
//                 </>
//               )}
//             </button>

//             {/* Powered by PropDeck */}
//             <div style={{ textAlign: 'center', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
//               <span style={{ fontSize: '1.2rem', color: '#6b7280', fontWeight: '600', fontStyle: 'italic' }}>
//                 Powered by
//               </span>
//               <img 
//   src="/logo.png"   // Must be exactly this - with forward slash
//   alt="PropDeck Logo" 
//   style={{ height: '24px', width: 'auto' }}
// />
//             </div>

//             {/* Messages */}
//             {success && (
//               <div style={{ marginBottom: '0.75rem', padding: '0.625rem', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '0.5rem', color: '#047857', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                 <CheckCircle size={14} />
//                 {success}
//               </div>
//             )}

//             {error && (
//               <div style={{ marginBottom: '0.75rem', padding: '0.625rem', background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                 <AlertCircle size={14} />
//                 {error}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Right Panel - Scrollable */}
//         <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
//           <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', margin: '0 0 1rem 0' }}>Generated Designs</h2>
          
//           <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
//             {generatedImages.length === 0 ? (
//               <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', borderRadius: '0.75rem', border: '2px dashed #d1d5db' }}>
//                 <div style={{ textAlign: 'center', padding: '2rem' }}>
//                   <Sparkles size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
//                   <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '0.5rem' }}>
//                     Your AI-generated designs will appear here
//                   </p>
//                   <p style={{ color: '#d1d5db', fontSize: '0.8rem' }}>
//                     Select a room and style, then click Generate Design
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//                 {generatedImages.map((image, index) => (
//                   <div key={image.id} style={{ position: 'relative' }}>
//                     <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//                       <img
//                         src={image.url}
//                         alt={`Design ${index + 1}`}
//                         style={{ width: '100%', height: 'auto', aspectRatio: '1/1', objectFit: 'contain', display: 'block', background: '#f9fafb' }}
//                       />
//                       <div 
//                         style={{ 
//                           position: 'absolute', 
//                           inset: 0, 
//                           background: 'rgba(0,0,0,0)',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           opacity: 0,
//                           transition: 'all 0.3s',
//                           borderRadius: '0.75rem'
//                         }}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
//                           e.currentTarget.style.opacity = '1';
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.background = 'rgba(0,0,0,0)';
//                           e.currentTarget.style.opacity = '0';
//                         }}
//                       >
//                         <button
//                           onClick={() => downloadImage(image.url, index)}
//                           style={{
//                             background: 'white',
//                             color: '#111827',
//                             padding: '0.625rem 1.25rem',
//                             borderRadius: '0.5rem',
//                             fontWeight: '600',
//                             border: 'none',
//                             cursor: 'pointer',
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: '0.5rem',
//                             boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//                             fontSize: '0.875rem'
//                           }}
//                         >
//                           <Download size={16} />
//                           Download
//                         </button>
//                       </div>
//                     </div>
//                     <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <span style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'capitalize' }}>
//                         {image.roomType.replace('_', ' ')}
//                       </span>
//                       <span style={{ fontSize: '0.8rem', color: '#9333ea', fontWeight: '500', textTransform: 'capitalize' }}>
//                         {image.style}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Registration Modal */}
//       <RegistrationModal
//         isOpen={showRegistrationModal}
//         onClose={() => {
//           // Only allow closing if registered
//           if (isRegistered) {
//             setShowRegistrationModal(false);
//           }
//         }}
//         onSuccess={handleRegistrationSuccess}
//         generatedCount={generationCount}
//         sessionId={sessionId}
//       />

//       <style>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         * {
//           box-sizing: border-box;
//         }
//         /* Custom scrollbar styling */
//         ::-webkit-scrollbar {
//           width: 6px;
//         }
//         ::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 10px;
//         }
//         ::-webkit-scrollbar-thumb {
//           background: #9333ea;
//           border-radius: 10px;
//         }
//         ::-webkit-scrollbar-thumb:hover {
//           background: #7c3aed;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default App;

import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Home, Bed, Briefcase, UtensilsCrossed, Loader2, AlertCircle, CheckCircle, Share2, Sofa } from 'lucide-react';
import { generateDesign, checkHealth, checkSession, incrementGeneration } from './api';
import RegistrationModal from './RegistrationModal';
import './App.css';

const App = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clientName = urlParams.get('client') || 'skyline';
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [imageHistory, setImageHistory] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');
  
  const [progress, setProgress] = useState(0);
  
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [sessionId, setSessionId] = useState('');

  const rooms = [
    { id: 'master_bedroom', name: 'Master Bedroom', icon: Bed },
    // { id: 'bedroom_1', name: 'Bedroom 1', icon: Bed },
    // { id: 'bedroom_2', name: 'Bedroom 2', icon: Bed },
    { id: 'living_room', name: 'Living Room', icon: Sofa },
    { id: 'kitchen', name: 'Kitchen', icon: Briefcase },
    // { id: 'dining_room', name: 'Dining Room', icon: UtensilsCrossed }
  ];

  const styles = [
    { id: 'modern', name: 'Modern' },
    { id: 'scandinavian', name: 'Scandinavian' },
    { id: 'industrial', name: 'Industrial' },
    { id: 'minimalist', name: 'Minimalist' },
    { id: 'traditional', name: 'Traditional' },
    { id: 'bohemian', name: 'Bohemian' }
  ];

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const health = await checkHealth();
        setApiStatus(health.status === 'healthy' ? 'connected' : 'disconnected');
      } catch (error) {
        setApiStatus('disconnected');
      }
    };
    checkApiHealth();

    let currentSessionId = sessionStorage.getItem('sessionId');
    if (!currentSessionId) {
      currentSessionId = 'web-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('sessionId', currentSessionId);
    }
    setSessionId(currentSessionId);

    try {
      const savedHistory = sessionStorage.getItem('imageHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setImageHistory(parsedHistory);
        setSelectedImageIndex(0);
        console.log('[APP] Restored', parsedHistory.length, 'images from session');
      }
    } catch (error) {
      console.error('[APP] Error restoring image history:', error);
      sessionStorage.removeItem('imageHistory');
    }

    const registeredEmail = localStorage.getItem('userEmail');
    const registeredName = localStorage.getItem('userName');
    const registeredPhone = localStorage.getItem('userPhone');
    
    if (registeredEmail && registeredName && registeredPhone) {
      setIsRegistered(true);
      setUserEmail(registeredEmail);
      setGenerationCount(0);
      console.log('[APP] User is registered:', registeredEmail);
    } else {
      checkServerGenerationCount(currentSessionId);
    }
  }, []);

  const checkServerGenerationCount = async (sessionId) => {
    try {
      const data = await checkSession(sessionId);
      
      if (data.success) {
        const count = data.generation_count || 0;
        setGenerationCount(count);
        console.log('[APP] Current generation count:', count);
        
        if (data.is_registered) {
          setIsRegistered(true);
          setUserEmail(data.email || '');
          localStorage.setItem('userEmail', data.email || '');
        }
      }
    } catch (error) {
      console.error('[APP] Error checking session:', error);
      const localCount = parseInt(localStorage.getItem('generationCount') || '0', 10);
      setGenerationCount(localCount);
    }
  };

  const handleGenerate = async () => {
    if (!selectedRoom) {
      setError('Please select a room type');
      return;
    }

    if (!selectedStyle && !customPrompt.trim()) {
      setError('Please select a style or enter a custom prompt');
      return;
    }

    if (!isRegistered && generationCount >= 2) {
      console.log('[APP] Generation limit reached. Showing registration modal...');
      setShowRegistrationModal(true);
      setError('⚠️ You\'ve used your 2 free generations. Please register to continue.');
      return;
    }

    await executeGeneration();
  };

  const executeGeneration = async () => {
    setIsGenerating(true);
    setError('');
    setSuccess('');
    setProgress(0);

    try {
      console.log('[APP] Starting generation...');
      setProgress(10);
      
      const result = await generateDesign(selectedRoom, selectedStyle, customPrompt, clientName);
      
      setProgress(50);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate');
      }

      console.log('[APP] 🎉 Generation completed!');
      setProgress(80);
      
      // ✅ FIXED: Use Cloudinary URL if available, fallback to base64
      const processedImages = [{
        id: result.images[0].id || Date.now(),
        url: result.images[0].image_url || result.images[0].cloudinary_url || `data:image/png;base64,${result.images[0].image_base64}`,
        cloudinaryUrl: result.images[0].image_url || result.images[0].cloudinary_url,
        style: result.images[0].style || selectedStyle || 'custom',
        roomType: result.images[0].room_type || selectedRoom,
        timestamp: Date.now()
      }];
      
      const newHistory = [...processedImages, ...imageHistory];
      setImageHistory(newHistory);
      
      // ✅ FIXED: Save only URLs to sessionStorage (lightweight)
      try {
        const lightweightHistory = newHistory.slice(0, 20).map(img => ({
          id: img.id,
          url: img.cloudinaryUrl || (img.url.startsWith('http') ? img.url : null),
          style: img.style,
          roomType: img.roomType,
          timestamp: img.timestamp
        })).filter(img => img.url && img.url.startsWith('http'));
        
        sessionStorage.setItem('imageHistory', JSON.stringify(lightweightHistory));
        console.log('[APP] Saved', lightweightHistory.length, 'image URLs to session');
      } catch (error) {
        console.error('[APP] Error saving to sessionStorage:', error);
        sessionStorage.clear();
      }
      
      setSelectedImageIndex(0);
      setSuccess('✅ Design generated successfully!');
      setProgress(100);

      if (!isRegistered) {
        const newCount = generationCount + 1;
        setGenerationCount(newCount);
        localStorage.setItem('generationCount', newCount.toString());
        
        try {
          await incrementGeneration(sessionId, selectedRoom, selectedStyle, customPrompt, clientName);
        } catch (err) {
          console.error('[APP] Error updating server count:', err);
        }

        console.log('[APP] Generation count updated:', newCount);
      }

    } catch (err) {
      console.error('[APP] Generation error:', err);
      setError(err.message || 'Failed to generate design. Please try again.');
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegistrationSuccess = async (data) => {
    console.log('[APP] Registration successful:', data);
    
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userName', data.name);
    localStorage.setItem('userPhone', data.phone);
    localStorage.setItem('userId', data.user_id);
    localStorage.removeItem('generationCount');
    
    setIsRegistered(true);
    setGenerationCount(0);
    setUserEmail(data.email);
    setShowRegistrationModal(false);
    setError('');
    setSuccess('🎉 Registration complete! You now have unlimited access.');
    
    console.log('[APP] User registered and modal closed');
  };

  // ✅ FIXED: Download function to handle both URLs and base64
  const downloadImage = async (image, index) => {
    try {
      if (image.url.startsWith('http')) {
        // Download from URL
        const response = await fetch(image.url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `design-${image.roomType}-${image.style}-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } else {
        // Download base64 directly
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `design-${image.roomType}-${image.style}-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('[APP] Download error:', error);
      setError('Failed to download image');
    }
  };

  // const shareImage = async (imageUrl) => {
  //   try {
  //     if (navigator.share) {
  //       const response = await fetch(imageUrl);
  //       const blob = await response.blob();
  //       const file = new File([blob], 'design.png', { type: 'image/png' });
        
  //       await navigator.share({
  //         title: 'AI Interior Design',
  //         text: 'Check out this amazing interior design!',
  //         files: [file]
  //       });
  //       setSuccess('✓ Shared successfully!');
  //     } else {
  //       await navigator.clipboard.writeText(window.location.href);
  //       setSuccess('✓ Link copied to clipboard!');
  //     }
  //   } catch (error) {
  //     if (error.name !== 'AbortError') {
  //       console.error('Share error:', error);
  //       setError('Failed to share. Please try again.');
  //     }
  //   }
  // };

  return (
    <div style={{ height: '100vh', background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 50%, #eff6ff 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', padding: '1rem 2rem 0.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem', margin: 0 }}>
          Reimagine Your Property with AI
        </h1>
      </div>

      <div style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '0.5rem 2rem 1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', overflow: 'hidden' }}>
        {/* Left Panel */}
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Home size={18} color="#374151" />
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>Select Room</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {rooms.map((room) => {
                  const Icon = room.icon;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room.id)}
                      style={{
                        padding: '0.625rem',
                        borderRadius: '0.5rem',
                        border: selectedRoom === room.id ? '2px solid #9333ea' : '2px solid #e5e7eb',
                        background: selectedRoom === room.id ? '#faf5ff' : 'white',
                        boxShadow: selectedRoom === room.id ? '0 4px 6px rgba(147,51,234,0.1)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Icon size={16} />
                      <span style={{ fontWeight: '500', fontSize: '0.8rem' }}>{room.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Sparkles size={18} color="#374151" />
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>Choose Style</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setSelectedStyle(style.id);
                      setCustomPrompt('');
                    }}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      border: selectedStyle === style.id ? '2px solid #9333ea' : '2px solid #e5e7eb',
                      background: selectedStyle === style.id ? '#faf5ff' : 'white',
                      boxShadow: selectedStyle === style.id ? '0 4px 6px rgba(147,51,234,0.1)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontWeight: '500', fontSize: '0.8rem' }}>{style.name}</span>
                  </button>
                ))}
              </div>

              <div style={{ textAlign: 'center', color: '#9ca3af', fontWeight: '500', margin: '0.5rem 0', fontSize: '0.75rem' }}>OR</div>

              <textarea
                value={customPrompt}
                onChange={(e) => {
                  setCustomPrompt(e.target.value);
                  if (e.target.value.trim()) setSelectedStyle('');
                }}
                placeholder="Describe your style (e.g., Space theme kids room, Tropical paradise...)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  resize: 'none',
                  height: '4rem',
                  fontSize: '0.8rem',
                  outline: 'none',
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#9333ea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || apiStatus === 'disconnected'}
              style={{
                width: '100%',
                background: isGenerating || apiStatus === 'disconnected' ? '#d1d5db' : '#256D11',
                color: 'white',
                padding: '0.875rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '1rem',
                border: 'none',
                cursor: isGenerating || apiStatus === 'disconnected' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 10px 15px rgba(37,109,17,0.3)',
                transition: 'all 0.2s',
                marginBottom: '1rem'
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Design
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem', color: '#6b7280', fontWeight: '600', fontStyle: 'italic' }}>
                Powered by
              </span>
              <img 
                src="/logo.png"
                alt="PropDeck Logo" 
                style={{ height: '24px', width: 'auto' }}
              />
            </div>

            {success && (
              <div style={{ marginBottom: '0.75rem', padding: '0.625rem', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '0.5rem', color: '#047857', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={14} />
                {success}
              </div>
            )}

            {error && (
              <div style={{ marginBottom: '0.75rem', padding: '0.625rem', background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', margin: '0 0 1rem 0' }}>Generated Designs</h2>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {imageHistory.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', borderRadius: '0.75rem', border: '2px dashed #d1d5db' }}>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Sparkles size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '0.5rem' }}>
                    Your AI-generated designs will appear here
                  </p>
                  <p style={{ color: '#d1d5db', fontSize: '0.8rem' }}>
                    Select a room and style, then click Generate Design
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                {imageHistory.length > 0 && (
                  <div style={{ flexShrink: 0 }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Previous Designs ({imageHistory.length})
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem', 
                      overflowX: 'auto', 
                      paddingBottom: '0.5rem'
                    }}>
                      {imageHistory.slice(0, 5).map((img, idx) => (
                        <button
                          key={`thumb-${img.timestamp}-${idx}`}
                          onClick={() => {
                            setSelectedImageIndex(idx);
                          }}
                          style={{
                            minWidth: '60px',
                            height: '60px',
                            border: selectedImageIndex === idx
                              ? '3px solid #9333ea' 
                              : '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            padding: 0,
                            background: 'none',
                            transition: 'all 0.2s',
                            boxShadow: selectedImageIndex === idx
                              ? '0 4px 6px rgba(147,51,234,0.3)'
                              : 'none'
                          }}
                        >
                          <img
                            src={img.url}
                            alt={`Thumbnail ${idx + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {imageHistory.map((image, index) => {
                  if (index !== selectedImageIndex) return null;
                  
                  return (
                  <div key={`main-${image.timestamp}-${index}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: 0 }}>
                    <div style={{ 
                      position: 'relative', 
                      width: '100%',
                      flex: 1,
                      borderRadius: '0.75rem', 
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      background: '#f9fafb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img
                        src={image.url}
                        alt={`Design ${index + 1}`}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#111827', fontWeight: '600', textTransform: 'capitalize' }}>
                          {image.roomType.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#9333ea', fontWeight: '500', textTransform: 'capitalize' }}>
                          {image.style}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => downloadImage(image, index)}
                          style={{
                            background: 'white',
                            color: '#111827',
                            padding: '0.625rem',
                            borderRadius: '50%',
                            fontWeight: '600',
                            border: '2px solid #e5e7eb',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            width: '45px',
                            height: '45px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#9333ea';
                            e.currentTarget.style.background = '#faf5ff';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => {
          if (isRegistered) {
            setShowRegistrationModal(false);
          }
        }}
        onSuccess={handleRegistrationSuccess}
        generatedCount={generationCount}
        sessionId={sessionId}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * {
          box-sizing: border-box;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #9333ea;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #7c3aed;
        }
      `}</style>
    </div>
  );
};

export default App;