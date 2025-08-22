'use client';

import { useEffect, useRef, useState, memo } from 'react';

const TurnstileWidget = memo(({ 
  onVerify, 
  onExpire, 
  onError, 
  className = '',
  size = 'normal'
}) => {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const widgetIdRef = useRef(null);
  const scriptLoadedRef = useRef(false);
  
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const isEnabled = process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === 'true';
  
  useEffect(() => {
    if (!isEnabled || !siteKey || isRendered) {
      return;
    }

    const loadTurnstile = async () => {
      if (scriptLoadedRef.current && window.turnstile) {
        setIsLoaded(true);
        return;
      }

      if (!scriptLoadedRef.current) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          scriptLoadedRef.current = true;
          setIsLoaded(true);
        };
        
        script.onerror = () => {
          console.error('Failed to load Turnstile script');
          if (onError) onError('Failed to load Turnstile');
        };
        
        document.head.appendChild(script);
      }
    };

    loadTurnstile();
  }, [isEnabled, siteKey, isRendered]);

  useEffect(() => {
    if (!isLoaded || !isEnabled || !siteKey || isRendered || !containerRef.current) {
      return;
    }

    try {
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
        size: size,
        callback: (token) => {
          if (onVerify) onVerify(token);
        },
        'expired-callback': () => {
          if (onExpire) onExpire();
        },
        'error-callback': () => {
          if (onError) onError('Verification failed');
        }
      });
      
      widgetIdRef.current = widgetId;
      setIsRendered(true);
      console.log('Turnstile widget rendered successfully');
    } catch (error) {
      console.error('Error rendering Turnstile widget:', error);
      if (onError) onError('Widget rendering failed');
    }
  }, [isLoaded, isEnabled, siteKey, size, onVerify, onExpire, onError, isRendered]);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile && typeof window.turnstile.remove === 'function') {
        try {
          window.turnstile.remove(widgetIdRef.current);
          console.log('Turnstile widget removed');
        } catch (error) {
          console.error('Error removing Turnstile widget:', error);
        }
      }
    };
  }, []);

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
    </div>
  );
});

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
