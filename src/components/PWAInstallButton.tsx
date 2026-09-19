import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        PWA Active
      </span>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 active:scale-95 transition"
        title="Install School Management as native app"
      >
        <Download className="w-3.5 h-3.5" />
        Install App
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
          Install on iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                    1
                  </span>
                  <p>
                    Tap the <strong>Share</strong> button (box with arrow pointing up) in the Safari bottom toolbar.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                    2
                  </span>
                  <p>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                    3
                  </span>
                  <p>
                    Tap <strong>Add</strong> in the top right. Launch the portal anytime with offline cache support!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      id="pwa-install-manual-btn"
      onClick={() => alert('To install this app on your device:\n• On Chrome/Edge: Click the install icon in the address bar.\n• On Mobile: Tap browser menu (⋮) -> "Add to Home screen" / "Install".')}
      className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
      title="How to install PWA"
    >
      <Download className="w-3.5 h-3.5 text-slate-400" />
      Install App
    </button>
  );
};
