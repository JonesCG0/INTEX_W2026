import { Link } from 'react-router-dom';
import '../styles/PrivacyPage.css';

const sections = [
  {
    title: 'Scope and applicability',
    items: [
      'This policy applies to the public website, the donor-facing experience, and the authenticated internal application operated by Project Haven.',
      'It describes how information is collected, used, disclosed, retained, and protected when you visit the site or interact with the organization.',
      'It does not govern information collected by third-party websites that may be linked from the site; those services are subject to their own policies.',
    ],
  },
  {
    title: 'Information we collect',
    items: [
      'Information you provide directly, including account credentials, contact details, and any content submitted through sign-up or authenticated workflows.',
      'Operational data entered by authorized staff for resident care, donations, reporting, and administrative purposes.',
      'Browser and device information necessary to maintain site security, troubleshoot errors, and preserve your cookie preference.',
    ],
  },
  {
    title: 'How we use information',
    items: [
      'Authenticate users, maintain secure sessions, and enforce role-based access controls.',
      'Operate the public website, support nonprofit administration, and produce anonymized impact summaries.',
      'Monitor availability, detect errors, and improve the performance and reliability of the site.',
    ],
  },
  {
    title: 'Disclosures and sharing',
    items: [
      'We do not sell personal information.',
      'We may share information with service providers that support hosting, authentication, storage, or maintenance, subject to confidentiality and security controls.',
      'We may disclose information when required by law, to protect rights and safety, or to operate the secure application.',
    ],
  },
  {
    title: 'Cookies and consent',
    items: [
      'Essential cookies are required for authentication, security, and preservation of your preference.',
      'Non-essential cookies are disabled until you provide consent.',
      'Your selection is stored in a browser cookie so the site can respect your preference on future visits.',
    ],
  },
  {
    title: 'Security and retention',
    items: [
      'We use role-based access control and secure transport where applicable to protect sensitive information.',
      'Records are retained only as long as needed for operational, legal, or reporting purposes.',
      'Access to resident information is limited to authorized personnel with a legitimate business need.',
    ],
  },
  {
    title: 'Questions and requests',
    items: [
      'If you have questions about this policy or want to request access, correction, or deletion of information, contact Project Haven through its official organizational channels.',
      'We may need to verify identity before acting on a request involving account or donor information.',
      'We will respond to requests in accordance with applicable law and organizational policy.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <div className="privacy-nav">
          <Link to="/" className="privacy-brand">
            Project Haven
          </Link>
          <div className="privacy-nav-links">
            <Link to="/">Home</Link>
            <Link to="/impact">Impact</Link>
            <Link to="/login">Log in</Link>
          </div>
        </div>
      </header>

      <main className="privacy-main">
        <section className="privacy-hero">
          <p className="privacy-eyebrow">Privacy policy</p>
          <h1>How Project Haven collects, uses, and protects information.</h1>
          <p className="privacy-lede">
            Project Haven is committed to protecting the privacy, dignity, and
            safety of survivors, staff, donors, and visitors. This policy
            explains our information practices and the choices available to you
            when you use the site.
          </p>
        </section>

        <section className="privacy-grid">
          {sections.map((section) => (
            <article key={section.title} className="privacy-card">
              <h2>{section.title}</h2>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="privacy-note">
          <div>
            <p className="privacy-eyebrow">Security note</p>
            <h2>Restricted records are accessible only to authorized users.</h2>
            <p>
              Resident records, counseling notes, and other sensitive internal
              information remain behind authentication and authorization
              controls. Public pages never display identifying survivor data.
            </p>
          </div>

          <div className="privacy-actions">
            <Link to="/signup" className="privacy-button privacy-button-primary">
              Create donor account
            </Link>
            <Link to="/" className="privacy-button privacy-button-secondary">
              Return home
            </Link>
          </div>
        </section>
      </main>

      <footer className="privacy-footer">
        <p>Project Haven uses only essential cookies unless you choose otherwise.</p>
        <p>Last updated: April 7, 2026.</p>
      </footer>
    </div>
  );
}
