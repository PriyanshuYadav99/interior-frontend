import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Home, Bed, Utensils, Bath, Briefcase, UtensilsCrossed, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { generateDesign, checkHealth } from './api';
import RegistrationModal from './RegistrationModal';
import './App.css';

const App = () => {
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');
  
  // Registration state
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const rooms = [
    { id: 'master_bedroom', name: 'Master Bedroom', icon: Bed },
    { id: 'bedroom_1', name: 'Bedroom 1', icon: Home },
    { id: 'bedroom_2', name: 'Bedroom 2', icon: Utensils },
    { id: 'living_room', name: 'Living Room', icon: Bath },
    { id: 'kitchen', name: 'Kitchen', icon: Briefcase },
    { id: 'dining_room', name: 'Dining Room', icon: UtensilsCrossed }
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

    // Load generation count and user info from localStorage
    const savedCount = localStorage.getItem('generationCount');
    const savedEmail = localStorage.getItem('userEmail');
    const savedVerified = localStorage.getItem('isVerified');

    if (savedCount) {
      setGenerationCount(parseInt(savedCount, 10));
    }

    if (savedEmail && savedVerified === 'true') {
      setUserEmail(savedEmail);
      setIsVerified(true);
    }

    // Check for pending verification
    checkPendingVerification();
  }, []);

  const checkPendingVerification = async () => {
    const pending = localStorage.getItem('pendingVerification');
    if (pending) {
      try {
        const { email } = JSON.parse(pending);
        const response = await fetch('http://localhost:5000/api/check-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.verified) {
          // User is now verified!
          setIsVerified(true);
          setUserEmail(email);
          localStorage.setItem('isVerified', 'true');
          localStorage.setItem('userEmail', email);
          localStorage.removeItem('pendingVerification');
          localStorage.removeItem('generationCount');
          setGenerationCount(0);
          setSuccess('Email verified! You can now generate unlimited designs.');
        }
      } catch (error) {
        console.error('Error checking verification:', error);
      }
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

    // ⚠️ CRITICAL FIX: Check BEFORE generation starts
    if (!isVerified && generationCount >= 2) {
      setShowRegistrationModal(true);
      setError('Please register to continue generating designs');
      return; // STOP HERE - don't generate
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const result = await generateDesign(selectedRoom, selectedStyle, customPrompt);
      
      if (result.success && result.images && result.images.length > 0) {
        const processedImages = result.images.map((img, index) => ({
          id: img.id || index,
          url: `data:image/png;base64,${img.image_base64}`,
          style: img.style,
          roomType: img.room_type
        }));
        
        setGeneratedImages(processedImages);
        setSuccess(`Successfully generated ${processedImages.length} design(s)!`);

        // Increment generation count only if not verified
        if (!isVerified) {
          const newCount = generationCount + 1;
          setGenerationCount(newCount);
          localStorage.setItem('generationCount', newCount.toString());
        }
      } else {
        setError('No images were generated. Please try again.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.response?.data?.error || 'Failed to generate design. Please check your API configuration and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegistrationSuccess = (data) => {
    console.log('Registration successful:', data);
    // Modal will show verification message
    // User needs to verify email before continuing
  };

  const downloadImage = (imageUrl, index) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `design-${selectedRoom}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 50%, #eff6ff 100%)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
            Reimagine Your Property with AI
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '1rem' }}>
            Transform your space with AI-powered interior design
          </p>
          
          {/* API Status */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '9999px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: apiStatus === 'connected' ? '#10b981' : apiStatus === 'disconnected' ? '#ef4444' : '#f59e0b' }}></div>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              API Status: {apiStatus === 'connected' ? 'Connected' : apiStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
            </span>
          </div>

          {/* Generation Counter (only show if not verified) */}
          {!isVerified && (
            <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '9999px', background: generationCount >= 2 ? '#fef3c7' : 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <Sparkles size={16} color={generationCount >= 2 ? '#d97706' : '#9333ea'} />
              <span style={{ fontSize: '0.875rem', color: generationCount >= 2 ? '#92400e' : '#6b7280', fontWeight: '500' }}>
                {generationCount}/2 free generations used
              </span>
            </div>
          )}

          {/* Verified Badge */}
          {isVerified && (
            <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '9999px', background: '#ecfdf5', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <CheckCircle size={16} color="#10b981" />
              <span style={{ fontSize: '0.875rem', color: '#047857', fontWeight: '500' }}>
                ✨ Unlimited generations • {userEmail}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Left Panel */}
          <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '2rem' }}>
            {/* Room Selection */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Home size={20} color="#374151" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>Select Room</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {rooms.map((room) => {
                  const Icon = room.icon;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room.id)}
                      style={{
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: selectedRoom === room.id ? '2px solid #9333ea' : '2px solid #e5e7eb',
                        background: selectedRoom === room.id ? '#faf5ff' : 'white',
                        boxShadow: selectedRoom === room.id ? '0 4px 6px rgba(147,51,234,0.1)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Icon size={20} />
                      <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>{room.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style Selection */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Sparkles size={20} color="#374151" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>Choose Style</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setSelectedStyle(style.id);
                      setCustomPrompt('');
                    }}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.75rem',
                      border: selectedStyle === style.id ? '2px solid #9333ea' : '2px solid #e5e7eb',
                      background: selectedStyle === style.id ? '#faf5ff' : 'white',
                      boxShadow: selectedStyle === style.id ? '0 4px 6px rgba(147,51,234,0.1)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>{style.name}</span>
                  </button>
                ))}
              </div>

              <div style={{ textAlign: 'center', color: '#9ca3af', fontWeight: '500', margin: '0.75rem 0' }}>OR</div>

              <textarea
                value={customPrompt}
                onChange={(e) => {
                  setCustomPrompt(e.target.value);
                  if (e.target.value.trim()) setSelectedStyle('');
                }}
                placeholder="Describe your style (e.g., Space theme kids room, Tropical paradise...)"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  resize: 'none',
                  height: '6rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#9333ea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Messages */}
            {success && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '0.5rem', color: '#047857', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} />
                {success}
              </div>
            )}

            {error && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || apiStatus === 'disconnected'}
              style={{
                width: '100%',
                background: isGenerating || apiStatus === 'disconnected' ? '#d1d5db' : 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                color: 'white',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '1.125rem',
                border: 'none',
                cursor: isGenerating || apiStatus === 'disconnected' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 10px 15px rgba(124,58,237,0.3)',
                transition: 'all 0.2s'
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Generating Design...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Design
                </>
              )}
            </button>
          </div>

          {/* Right Panel */}
          <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>Generated Designs</h2>
            
            {generatedImages.length === 0 ? (
              <div style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', borderRadius: '0.75rem', border: '2px dashed #d1d5db' }}>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Sparkles size={64} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ color: '#9ca3af', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                    Your AI-generated designs will appear here
                  </p>
                  <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                    Select a room and style, then click Generate Design
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {generatedImages.map((image, index) => (
                  <div key={image.id} style={{ position: 'relative' }}>
                    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      <img
                        src={image.url}
                        alt={`Design ${index + 1}`}
                        style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
                      />
                      <div 
                        style={{ 
                          position: 'absolute', 
                          inset: 0, 
                          background: 'rgba(0,0,0,0)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'all 0.3s',
                          borderRadius: '0.75rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
                          e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(0,0,0,0)';
                          e.currentTarget.style.opacity = '0';
                        }}
                      >
                        <button
                          onClick={() => downloadImage(image.url, index)}
                          style={{
                            background: 'white',
                            color: '#111827',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Download size={20} />
                          Download
                        </button>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'capitalize' }}>
                        {image.roomType.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: '#9333ea', fontWeight: '500', textTransform: 'capitalize' }}>
                        {image.style}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={handleRegistrationSuccess}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default App;