import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  X,
  Copy,
  Check,
  MoreVertical,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);

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

  if (!isOpen) return null;

  const currentUrl = window.location.href.split('#')[0];

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#141218] border border-[#E2B755]/35 rounded-3xl p-5 sm:p-7 text-white shadow-2xl space-y-5 max-h-[94vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F0D58C] via-[#E2B755] to-[#B88728] text-stone-950 flex items-center justify-center shadow-lg font-bold shrink-0">
            <Smartphone size={24} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-[#E2B755] text-stone-950">
                OFFICIAL ANDROID APP
              </span>
              <span className="text-xs text-[#E2B755] font-semibold">Bloom Saloon</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-luxury mt-0.5 text-white">
              Install Directly on Your Phone
            </h3>
          </div>
        </div>

        {/* Direct One-Click Button (If supported by phone) */}
        {deferredPrompt ? (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-stone-900 to-stone-900 border border-[#E2B755]/50 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#E2B755]">
              <Sparkles size={16} />
              <span>1-Tap Instant Installation Ready!</span>
            </div>
            <p className="text-xs text-stone-300">
              Your mobile browser supports direct installation. Tap below to add Bloom Saloon directly to your Android home screen:
            </p>
            <button
              onClick={handleInstallClick}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#F0D58C] via-[#E2B755] to-[#D4A137] hover:brightness-105 active:scale-98 text-stone-950 font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Download size={20} />
              <span>Tap Here to Install App Now</span>
            </button>
          </div>
        ) : (
          /* Mobile Chrome 2-Step Visual Guide */
          <div className="space-y-3">
            <div className="text-xs text-amber-200/90 font-medium">
              Android Chrome installs this app directly to your home screen without needing manual file downloads:
            </div>

            {/* Step 1 */}
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#E2B755] flex items-center justify-center font-bold text-sm shrink-0 border border-[#E2B755]/30">
                1
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Tap the Chrome menu button</span>
                  <span className="p-1 rounded bg-stone-800 border border-stone-700 inline-flex items-center text-[#E2B755]">
                    <MoreVertical size={14} />
                  </span>
                </p>
                <p className="text-xs text-stone-400 leading-relaxed">
                  In Google Chrome on your phone, look at the top-right corner and tap the <strong>three vertical dots (⋮)</strong>.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#E2B755] flex items-center justify-center font-bold text-sm shrink-0 border border-[#E2B755]/30">
                2
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Tap "Install app" or "Add to Home screen"</span>
                  <Download size={14} className="text-[#E2B755]" />
                </p>
                <p className="text-xs text-stone-400 leading-relaxed">
                  In the menu list that pops up, scroll down slightly and tap <strong>"Install app"</strong> (on older devices, it is named <strong>"Add to Home screen"</strong>).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/30">
                3
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Confirm "Install"</span>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                </p>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Tap <strong>"Install"</strong> on the Android confirmation prompt. Android automatically places the official <strong>Bloom Saloon</strong> app icon on your home screen!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Box */}
        <div className="p-3.5 rounded-xl bg-stone-950/60 border border-white/5 space-y-1.5 text-[11px] text-stone-400">
          <div className="text-stone-300 font-semibold flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Why this is better than downloading loose APK files:</span>
          </div>
          <p>
            • Installs securely without Android "Harmful file / Unknown source" warnings.
          </p>
          <p>
            • Launches full screen in standalone mode (no browser address bar).
          </p>
          <p>
            • Always stays up-to-date automatically whenever services or prices change.
          </p>
        </div>

        {/* Copy App Link */}
        <div className="pt-2 flex items-center justify-between gap-3 text-xs border-t border-white/10">
          <div className="truncate text-stone-400 text-[11px]">
            <span>App Link: </span>
            <span className="text-stone-300 font-mono">{currentUrl}</span>
          </div>
          <button
            onClick={copyUrl}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 text-xs font-semibold"
          >
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
