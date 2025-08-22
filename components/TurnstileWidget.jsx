'use client';

import { useEffect, useRef, useState } from 'react';

export default function TurnstileWidget({ 
  onVerify, 
  onExpire, 
  onError, 
  className = '',
  size = 'normal'
}) {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const isEnabled = process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === 'true';
  
  useEffect(() => {
    if (!isEnabled || !siteKey) {
      console.log('Turnstile disabled or site key not found');
      return;
    }

    const loadTurnstile = () => {
      if (window.turnstile) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoaded(true);
        renderWidget();
      };
      script.onerror = () => {
        console.error('Failed to load Turnstile script');
        if (onError) onError('Failed to load Turnstile');
      };
      document.head.appendChild(script);
    };

    loadTurnstile();
  }, [isEnabled, siteKey, onError]);

  useEffect(() => {
    if (isLoaded && isEnabled && siteKey) {
      renderWidget();
    }
  }, [isLoaded, isEnabled, siteKey]);

  const renderWidget = () => {
    if (!window.turnstile || !containerRef.current) return;

    try {
      window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
        size: size,
        callback: (token) => {
          setIsVerified(true);
          if (onVerify) onVerify(token);
        },
        'expired-callback': () => {
          setIsVerified(false);
          if (onExpire) onExpire();
        },
        'error-callback': () => {
          setIsVerified(false);
          if (onError) onError('Verification failed');
        }
      });
    } catch (error) {
      console.error('Error rendering Turnstile widget:', error);
      if (onError) onError('Widget rendering failed');
    }
  };

  if (!isEnabled) {
    return null;
  }

  if (!siteKey) {
    console.warn('Turnstile site key not found');
    return null;
  }

  return (
    <div className={`turnstile-container ${className}`}>
      <div 
        ref={containerRef} 
        className="turnstile-widget"
        style={{ 
          display: 'flex', 
          justifyContent: 'center',
          margin: '1rem 0'
        }}
      />
      {isVerified && (
        <div className="text-green-600 text-sm mt-2 text-center">
          ✓ Verifikasi berhasil
        </div>
      )}
    </div>
  );
}
