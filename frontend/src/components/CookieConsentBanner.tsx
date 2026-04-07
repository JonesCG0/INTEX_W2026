import { useEffect, useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { type CookieConsentChoice, readConsentChoice, writeConsentChoice } from '../lib/cookieConsent';

import '../styles/CookieConsentBanner.css';

export function CookieConsentBanner(): ReactElement | null {
  const [choice, setChoice] = useState<CookieConsentChoice | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const storedChoice = readConsentChoice();
    setChoice(storedChoice);
    setVisible(storedChoice === null);
  }, []);

  function handleChoice(nextChoice: CookieConsentChoice) {
    writeConsentChoice(nextChoice);
    setChoice(nextChoice);
    setVisible(false);
  }

  if (!visible || choice !== null) {
    return null;
  }

  return (
    <div className="cookie-banner" role="dialog" aria-labelledby="cookie-banner-title" aria-describedby="cookie-banner-description">
      <div className="cookie-banner-copy">
        <p className="cookie-banner-eyebrow">Cookie consent</p>
        <h2 id="cookie-banner-title">Cookie preferences</h2>
        <p id="cookie-banner-description">
          Project Haven uses essential cookies for authentication, security, and to remember your
          consent choice. Non-essential cookies remain disabled until you provide consent.
        </p>
        <p className="cookie-banner-link">
          <Link to="/privacy">Read the privacy policy</Link>
        </p>
      </div>

      <div className="cookie-banner-actions">
        <button type="button" className="cookie-banner-button cookie-banner-button-secondary" onClick={() => handleChoice('necessary')}>
          Necessary only
        </button>
        <button type="button" className="cookie-banner-button cookie-banner-button-primary" onClick={() => handleChoice('all')}>
          Accept all
        </button>
      </div>
    </div>
  );
}
