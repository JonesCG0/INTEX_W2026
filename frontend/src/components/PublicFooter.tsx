import { Link } from 'react-router-dom';
import CulturalDivider from './CulturalDivider';

export default function PublicFooter() {
  return (
    <footer className="bg-card border-t border-border">
      <CulturalDivider variant="hopi" className="px-8" />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-xl text-primary mb-3">Project Haven</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Supporting Native American youth through culturally grounded safehouse programs.
            </p>
          </div>
          <div>
            <h4 className="font-body text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Navigate</h4>
            <div className="space-y-2">
              <Link to="/" className="block font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link to="/impact" className="block font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Impact Dashboard</Link>
              <Link to="/privacy" className="block font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <a href="#donate" className="block font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Donate</a>
            </div>
          </div>
          <div>
            <h4 className="font-body text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Contact</h4>
            <p className="font-body text-sm text-muted-foreground">
              info@projecthaven.org<br />
              P.O. Box 1234<br />
              First Mesa, AZ 86023
            </p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} Project Haven. All rights reserved. Built with respect for all tribal nations.
          </p>
        </div>
      </div>
    </footer>
  );
}
