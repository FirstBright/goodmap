import React, { useEffect, useRef, useState } from 'react';
import styles from '@/styles/AdFitBanner.module.css';

interface AdFitBannerProps {
  mobileAdUnit?: string;
  pcAdUnit?: string;
  enabled?: boolean;
  className?: string;
}

const AdFitBanner: React.FC<AdFitBannerProps> = ({
  mobileAdUnit = 'DAN-WCxQYYTxuTSxEFAF',
  pcAdUnit = 'DAN-h3lEt6y18Q5XJYRN',
  enabled = true,
  className,
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detect device based on screen width
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1435px)');
    setIsMobile(mediaQuery.matches);

    const handleResize = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  // Load ad script
  useEffect(() => {
    if (!enabled || !adRef.current) return;
  
    // cleanup 이전 광고
    adRef.current.innerHTML = "";
  
    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.setAttribute("style", "display:none;");
    ins.setAttribute("data-ad-unit", isMobile ? mobileAdUnit : pcAdUnit);
    ins.setAttribute("data-ad-width", isMobile ? "320" : "160");
    ins.setAttribute("data-ad-height", isMobile ? "50" : "600");
  
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/kas/static/ba.min.js";
    script.async = true;
  
    adRef.current.appendChild(ins);
    adRef.current.appendChild(script);
  }, [enabled, isMobile, mobileAdUnit, pcAdUnit]);

  if (!enabled) return null;

  return (
    <div ref={adRef} className={`${styles.adContainer} ${className || ''} ${isMobile ? styles.mobile : styles.pc}`}>
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={isMobile ? mobileAdUnit : pcAdUnit}
        data-ad-width={isMobile ? '320' : '160'}
        data-ad-height={isMobile ? '50' : '600'}
      />
    </div>
  );
};

export default AdFitBanner;