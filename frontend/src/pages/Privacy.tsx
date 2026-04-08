import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';
import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-slate dark:prose-invert max-w-none"
          >
            <h1 className="font-display text-4xl mb-8">Privacy Policy</h1>
            <p className="font-body text-muted-foreground mb-6">Last Updated: April 8, 2026</p>

            <section className="mb-8">
              <h2 className="font-display text-2xl mb-4">1. Data Protection Commitment</h2>
              <p className="font-body text-foreground">
                At Project Haven, we are committed to protecting the privacy and dignity of both our residents and our donors. Given the sensitive nature of our work in safehouses for girls, we adhere to strict data security standards (IS414 Compliance) to ensure that no identifying information is exposed without explicit consent and legal necessity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-2xl mb-4">2. Information We Collect</h2>
              <h3 className="text-xl mb-2">For Donors:</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Contact Information (Name, Email, Phone)</li>
                <li>Contribution History (Monetary, In-Kind, Volunteer hours)</li>
                <li>Digital Analytics (To improve our outreach performance)</li>
              </ul>
              <h3 className="text-xl mb-2">For Residents:</h3>
              <p>
                We collect demographic and case-management data strictly for the purposes of improving care outcomes. On our public dashboards, all resident data is **strictly anonymized and aggregated** to prevent any identification of specific individuals.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-2xl mb-4">3. Data Security</h2>
              <p>
                We implement industry-standard security measures, including multi-factor authentication for staff, encrypted database storage, and regular security audits. Our staff are trained in trauma-informed data handling to ensure that "voices of hope" are shared safely.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-display text-2xl mb-4">4. Contact Us</h2>
              <p>
                If you have questions about your data or wish to request data deletion, please contact our Data Protection Officer at <span className="text-primary font-bold">privacy@projecthaven.local</span>.
              </p>
            </section>
          </motion.div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
