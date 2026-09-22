import React from 'react';
import { useOnlineStatus } from '../src/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { language } = useLanguage();

  if (isOnline) return null;

  return (
    <div 
      id="offline-status-banner"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600/95 dark:bg-amber-700/95 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white shadow-xl border border-amber-400/30 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-100"></span>
      </span>
      <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
      <span>
        {language === 'fi' ? 'Offline-tila — Välimuistissa oleva sisältö käytössä' : 'Offline Mode — Serving cached content'}
      </span>
    </div>
  );
};

export default OfflineIndicator;
