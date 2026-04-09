import { Link } from 'react-router-dom';
import CulturalDivider from './CulturalDivider';

export default function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <CulturalDivider variant="hopi" className="px-4 sm:px-8" />
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <h3 className="font-display text-2xl text-primary mb-3">Project Haven</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md">
              Project Haven begins with Hopi-serving safehouse care in Arizona and is being designed to expand responsibly across tribal nations through culturally grounded, trauma-informed support.
            </p>
          </div>
          <div>
            <h4 className="font-body text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Navigate</h4>
            <div className="space-y-2">
              <Link to="/" className="block font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link to="/impact" className="block font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Impact</Link>
              <Link to="/privacy" className="block font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <a href="/#donate" className="block font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Donate</a>
            </div>
          </div>
          <div>
            <h4 className="font-body text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Stewardship</h4>
            <p className="font-body text-sm text-muted-foreground">
              Transparent reporting and donor stewardship are available through the impact dashboard and secure portal experiences.
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} Project Haven. Built with respect for Hopi communities first and with care for future intertribal expansion.
          </p>
        </div>
      </div>
    </footer>
  );
}
