import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { type ImpactDashboard } from '../api';
import '../styles/ImpactPage.css';

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function ImpactPage() {
  const [data, setData] = useState<ImpactDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    api
      .publicImpact()
      .then((dashboard) => {
        if (!cancelled) {
          setData(dashboard);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load impact data.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const maxDonation = useMemo(
    () => Math.max(...(data?.donationTrend.map((point) => point.donationAmountPhp) ?? [0]), 1),
    [data],
  );

  const maxReach = useMemo(
    () => Math.max(...(data?.platformPerformance.map((point) => point.reach) ?? [0]), 1),
    [data],
  );

  return (
    <div className="impact-page">
      <header className="impact-header">
        <div className="impact-nav">
          <Link to="/" className="impact-brand">
            Project Haven
          </Link>
          <div className="impact-nav-links">
            <Link to="/">Home</Link>
            <a href="#impact-summary">Summary</a>
            <a href="#safehouses">Safehouses</a>
            <Link to="/login" className="impact-login-link">
              Log in
            </Link>
          </div>
        </div>
      </header>

      <main className="impact-main">
        <section className="impact-hero" id="impact-summary">
          <div className="impact-hero-copy">
            <p className="impact-eyebrow">Public impact dashboard</p>
            <h1>See how support turns into measurable, anonymized outcomes.</h1>
            <p className="impact-lede">
              This dashboard reads directly from the connected Azure database
              and shows public-facing metrics without exposing private resident
              details.
            </p>

            <div className="impact-hero-meta">
              {loading ? (
                <span className="impact-pill">Loading live data...</span>
              ) : error ? (
                <span className="impact-pill impact-pill-error">{error}</span>
              ) : (
                <>
                  <span className="impact-pill">{data?.hero.publishedLabel}</span>
                  <span className="impact-pill">{data?.hero.updatedLabel}</span>
                </>
              )}
            </div>
          </div>

          <div className="impact-hero-panel">
            {data?.hero ? (
              <>
                <span className="impact-panel-kicker">Latest published snapshot</span>
                <h2>{data.hero.headline}</h2>
                <p>{data.hero.summary}</p>
              </>
            ) : (
              <div className="impact-loading-copy">
                <span className="impact-panel-kicker">Latest published snapshot</span>
                <h2>Loading public impact data...</h2>
                <p>
                  The dashboard is reading the connected Azure SQL tables and
                  preparing the latest public summary.
                </p>
              </div>
            )}
          </div>
        </section>

        {error ? null : (
          <>
            <section className="impact-section">
              <div className="impact-metric-grid">
                {data?.metrics.map((metric) => (
                  <article key={metric.label} className="impact-metric-card">
                    <span>{metric.label}</span>
                    <strong>{metric.valueDisplay}</strong>
                    <p>{metric.detail}</p>
                  </article>
                )) ?? null}
              </div>
            </section>

            <section className="impact-section impact-split">
              <article className="impact-panel">
                <div className="impact-section-heading">
                  <p className="impact-eyebrow">Monthly trend</p>
                  <h2>Donation flow and resident care over time</h2>
                </div>

                <div className="impact-chart">
                  {data?.donationTrend.map((point) => (
                    <div key={point.monthLabel} className="impact-chart-row">
                      <div className="impact-chart-label">
                        <strong>{point.monthLabel}</strong>
                        <span>{formatMoney(point.donationAmountPhp)}</span>
                      </div>

                      <div className="impact-chart-bars">
                        <div className="impact-bar-track">
                          <div
                            className="impact-bar impact-bar-donation"
                            style={{ width: `${(point.donationAmountPhp / maxDonation) * 100}%` }}
                          />
                        </div>
                        <div className="impact-chart-secondary">
                          <span>Residents: {point.activeResidents}</span>
                          <span>Education: {Math.round(point.avgEducationProgress)}%</span>
                          <span>Health: {Math.round(point.avgHealthScore * 20)}%</span>
                        </div>
                      </div>
                    </div>
                  )) ?? <p className="impact-empty">No monthly trend data was returned.</p>}
                </div>
              </article>

              <article className="impact-panel">
                <div className="impact-section-heading">
                  <p className="impact-eyebrow">Content performance</p>
                  <h2>Which platforms drive the most reach?</h2>
                </div>

                <div className="impact-platform-list">
                  {data?.platformPerformance.map((platform) => (
                    <div key={platform.platform} className="impact-platform-row">
                      <div className="impact-platform-topline">
                        <strong>{platform.platform}</strong>
                        <span>{formatPercent(platform.engagementRate)}</span>
                      </div>
                      <div className="impact-bar-track impact-bar-track-secondary">
                        <div
                          className="impact-bar impact-bar-platform"
                          style={{ width: `${(platform.reach / maxReach) * 100}%` }}
                        />
                      </div>
                      <div className="impact-platform-meta">
                        <span>Reach {platform.reach.toLocaleString()}</span>
                        <span>Referrals {platform.donationReferrals.toLocaleString()}</span>
                      </div>
                    </div>
                  )) ?? <p className="impact-empty">No platform data was returned.</p>}
                </div>
              </article>
            </section>

            <section className="impact-section" id="safehouses">
              <div className="impact-section-heading">
                <p className="impact-eyebrow">Safehouse snapshot</p>
                <h2>Operational sites and current occupancy</h2>
              </div>

              <div className="impact-safehouse-grid">
                {data?.safehouses.map((safehouse) => {
                  const occupancyRatio = safehouse.capacityGirls > 0
                    ? safehouse.currentOccupancy / safehouse.capacityGirls
                    : 0;

                  return (
                    <article key={safehouse.safehouseId} className="impact-safehouse-card">
                      <div className="impact-safehouse-head">
                        <div>
                          <h3>{safehouse.name}</h3>
                          <p>
                            {safehouse.city}, {safehouse.region}
                          </p>
                        </div>
                        {safehouse.latestMonthLabel ? (
                          <span className="impact-pill">{safehouse.latestMonthLabel}</span>
                        ) : null}
                      </div>

                      <div className="impact-safehouse-statline">
                        <strong>
                          {safehouse.currentOccupancy}/{safehouse.capacityGirls} residents
                        </strong>
                        <span>{safehouse.capacityStaff} staff capacity</span>
                      </div>

                      <div className="impact-bar-track">
                        <div
                          className="impact-bar impact-bar-safehouse"
                          style={{ width: `${Math.min(occupancyRatio, 1) * 100}%` }}
                        />
                      </div>

                      <dl className="impact-safehouse-details">
                        <div>
                          <dt>Education</dt>
                          <dd>
                            {safehouse.avgEducationProgress !== null
                              ? `${Math.round(safehouse.avgEducationProgress)}%`
                              : 'No data'}
                          </dd>
                        </div>
                        <div>
                          <dt>Health</dt>
                          <dd>
                            {safehouse.avgHealthScore !== null
                              ? `${Math.round(safehouse.avgHealthScore * 20)}%`
                              : 'No data'}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  );
                }) ?? <p className="impact-empty">No safehouse data was returned.</p>}
              </div>
            </section>

            <section className="impact-section impact-story-section">
              <article className="impact-story-card">
                <p className="impact-eyebrow">Recent public snapshots</p>
                <div className="impact-story-stack">
                  {data?.snapshots.map((snapshot) => (
                    <div key={`${snapshot.snapshotDate}-${snapshot.headline}`} className="impact-story">
                      <div className="impact-story-topline">
                        <strong>{snapshot.headline}</strong>
                        <span>
                          {new Date(snapshot.snapshotDate).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p>{snapshot.summary}</p>
                    </div>
                  )) ?? <p className="impact-empty">No published snapshots were returned.</p>}
                </div>
              </article>

              <aside className="impact-cta-card">
                <p className="impact-eyebrow">Next step</p>
                <h2>Support the mission or move into the secure app.</h2>
                <p>
                  Donors can sign up or log in. Staff can move straight to the
                  secure portal after authentication.
                </p>
                <div className="impact-cta-actions">
                  <Link to="/signup" className="impact-button impact-button-primary">
                    Create donor account
                  </Link>
                  <Link to="/login" className="impact-button impact-button-secondary">
                    Log in
                  </Link>
                  <Link to="/" className="impact-button impact-button-ghost">
                    Back to home
                  </Link>
                </div>
              </aside>
            </section>
          </>
        )}
      </main>

      <footer className="impact-footer">
        <p>
          Public impact data is anonymized and read from the connected database.
        </p>
        <p>
          <Link to="/privacy">Privacy policy</Link>
        </p>
      </footer>
    </div>
  );
}
