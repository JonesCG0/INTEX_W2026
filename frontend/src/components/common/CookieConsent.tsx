import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCookie, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { getConsentState, setConsentState, type HavenConsentState } from '@/lib/cookie-consent';

export const CookieConsent = ({ onConsentChange }: { onConsentChange?: (state: HavenConsentState) => void }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = getConsentState();
    if (!consent) {
      setShow(true);
    }
  }, []);

  const updateConsent = (state: HavenConsentState) => {
    setConsentState(state);
    onConsentChange?.(state);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 right-6 z-[100] max-w-md"
        >
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-2xl backdrop-blur-md">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#1D6968]/10 rounded-lg">
                <IconCookie className="w-6 h-6 text-[#1D6968]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-body font-semibold mb-2">Cookie Privacy</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                  We use essential cookies for authentication, theme preferences, and basic security. Optional features remain disabled unless you explicitly allow them.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => updateConsent('all')} className="bg-[#1D6968] hover:bg-[#1D6968]/90 text-white">
                    Accept All
                  </Button>
                  <Button variant="outline" onClick={() => updateConsent('essential')}>
                    Essential Only
                  </Button>
                </div>
              </div>
              <button 
                onClick={() => updateConsent('dismissed')}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                aria-label="Close"
              >
                <IconX size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
