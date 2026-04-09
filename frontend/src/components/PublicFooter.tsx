import { Link } from 'react-router-dom';
import CulturalDivider from './CulturalDivider';

export default function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <CulturalDivider variant="hopi" className="px-4 sm:px-8" />
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-display text-2xl text-primary mb-3">Project Haven</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md">
              A youth-first safehouse network rooted in cultural identity, trauma-informed care, and transparent stewardship.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Navigate</h4>
            <div className="space-y-2">
              <Link to="/" className="block font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link to="/impact" className="block font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Impact</Link>
              <Link to="/privacy" className="block font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <a href="/#donate" className="block font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Donate</a>
            </div>
          </div>

          {/* Contact Us */}
          <div id="contact">
            <h4 className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Contact Us</h4>
            {/* ↓ Replace with your real contact details */}
            <ul className="space-y-3 font-body text-sm text-muted-foreground">
              <li>
                <a href="mailto:info@jonescg0.net" className="hover:text-primary transition-colors">
                  info@jonescg0.net
                </a>
              </li>
              <li>
                <a href="tel:+18005550100" className="hover:text-primary transition-colors">
                  1-800-555-0100
                </a>
              </li>
              <li className="leading-relaxed">
                Arizona Hopi Safehouse Network<br />
                United States
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Follow Us</h4>
            {/* ↓ Replace these hrefs with your real social media URLs */}
            <ul className="space-y-3 font-body text-sm">
              <li>
                <a
                  href="https://www.linkedin.com/in/carson-jones-262903280/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Project Haven on Facebook"
                >
                  <svg className="h-4 w-4 shrink-0" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/ashlynn-burgess/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Project Haven on Instagram"
                >
                  <svg className="h-4 w-4 shrink-0" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/tanneratkinson/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Project Haven on X (Twitter)"
                >
                  <svg className="h-4 w-4 shrink-0" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X (Twitter)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} Project Haven. Built with respect for Hopi communities first and with care for future intertribal expansion.
          </p>
          <Link to="/privacy" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
