'use client';

import { useEffect, useRef } from 'react';

export default function TurnstileWidget({ 
  onVerify, 
  onExpire, 
  onError, 
  className = '',
  size = 'normal'
}) {
  const ref = useRef(null);
  const widgetIdRef = useRef(null); // Ref untuk menyimpan ID widget

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const isEnabled = process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === 'true';

  useEffect(() => {
    if (!isEnabled || !siteKey || !ref.current) {
      return;
    }

    const renderWidget = () => {
      if (window.turnstile && ref.current) {
        // Hapus widget lama jika ada sebelum merender yang baru
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
        }

        const widgetId = window.turnstile.render(ref.current, {
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
        widgetIdRef.current = widgetId; // Simpan ID widget yang baru
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
      script.async = true;
      script.defer = true;
      
      // Definisikan callback global agar bisa dipanggil dari skrip
      window.onloadTurnstileCallback = () => {
        renderWidget();
      };
      
      script.onerror = () => {
        console.error('Failed to load Turnstile script');
        if (onError) onError('Failed to load Turnstile');
      };
      
      document.head.appendChild(script);
    }

    // Fungsi cleanup untuk menghapus widget saat komponen unmount
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [isEnabled, siteKey, onVerify, onExpire, onError, size]);

  if (!isEnabled) {
    return null;
  }

  if (!siteKey) {
    console.warn('Turnstile site key not found in .env.local');
    return (
      <div className="text-red-500 text-center p-4 bg-red-50 rounded-md">
        Turnstile site key belum diatur.
      </div>
    );
  }

  return (
    <div className={`turnstile-container ${className}`}>
      <div 
        ref={ref} 
        className="turnstile-widget"
        style={{ 
          display: 'flex', 
          justifyContent: 'center',
          margin: '1rem 0'
        }}
      />
    </div>
  );
}