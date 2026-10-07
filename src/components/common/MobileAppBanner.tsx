import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Check, ArrowRight } from 'lucide-react';

interface MobileAppBannerProps {
  onOpenModal: () => void;
}

export const MobileAppBanner: React.FC<MobileAppBannerProps> = ({ onOpenModal }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isDismissed || isInstalled) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      onOpenModal();
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#1E1B24] via-[#2A2433] to-[#1E1B24] border-b border-[#E2B755]/30 text-white px-3 py-2.5 sm:px-4 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: App Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F0D58C] to-[#C59B27] flex items-center justify-center text-stone-950 font-bold shrink-0 shadow-sm">
            <Smartphone size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate">Bloom Saloon App</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-black bg-[#E2B755] text-stone-950">
                ANDROID
              </span>
            </div>
            <p className="text-[11px] text-amber-200/80 truncate hidden xs:block">
              Install directly to your phone screen
            </p>
          </div>
        </div>

        {/* Right: Action Button & Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#F0D58C] via-[#E2B755] to-[#D4A137] hover:brightness-105 active:scale-95 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Download size={13} />
            <span>Install on Mobile</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
