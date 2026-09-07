import { useState, useEffect } from 'react';
import { DeviceMode } from '../types';

export function useDeviceMode(): { deviceMode: DeviceMode; width: number; height: number } {
  const [deviceInfo, setDeviceInfo] = useState<{ deviceMode: DeviceMode; width: number; height: number }>(() => {
    if (typeof window === 'undefined') {
      return { deviceMode: 'pc', width: 1200, height: 800 };
    }
    const w = window.innerWidth;
    const h = window.innerHeight;
    const ua = navigator.userAgent.toLowerCase();

    const isMobileUA = /iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua);
    const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(ua);

    let mode: DeviceMode = 'pc';
    if (w < 768 || isMobileUA) {
      mode = 'mobile';
    } else if (w < 1024 || isTabletUA) {
      mode = 'tablet';
    } else {
      mode = 'pc';
    }

    return { deviceMode: mode, width: w, height: h };
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const ua = navigator.userAgent.toLowerCase();

      const isMobileUA = /iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua);
      const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(ua);

      let mode: DeviceMode = 'pc';
      if (w < 768 || (isMobileUA && w < 900)) {
        mode = 'mobile';
      } else if (w < 1080 || isTabletUA) {
        mode = 'tablet';
      } else {
        mode = 'pc';
      }

      setDeviceInfo({ deviceMode: mode, width: w, height: h });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
}
