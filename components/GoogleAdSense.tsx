"use client";

import { useEffect, useRef } from 'react';

interface GoogleAdSenseProps {
  clientId: string;
  enabled?: boolean;
}

const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
  clientId = 'ca-pub-9025940068718161',
  enabled = true,
}) => {
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Create script element
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';

    // Append to document head
    document.head.appendChild(script);
    scriptRef.current = script;

    // Cleanup
    return () => {
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
      }
    };
  }, [enabled, clientId]);

  if (!enabled) return null;

  return null; // No visible content, just loads script
};

export default GoogleAdSense;