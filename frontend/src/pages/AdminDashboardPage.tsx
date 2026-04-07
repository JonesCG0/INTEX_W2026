import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import api, {
  type AdminPortalDonor,
  type AdminPortalOverview,
  type AdminPortalResident,
} from '../api';
import { AdminShell } from '../components/AdminShell';
import './AdminDashboardPage.css';

type ResidentFormState = {
  codeName: string;
  safehouse: string;
  caseCategory: string;
  riskLevel: string;
  status: string;
  assignedStaff: string;
  progressPercent: number;
  nextReviewAt: string;
};

type RecordingFormState = {
  residentId: number;
  sessionAt: string;
  staffName: string;
  sessionType: string;
  emotionalState: string;
  summary: string;
  interventions: string;
  followUp: string;
};

type VisitationFormState = {
  residentId: number;
  visitAt: string;
  visitType: string;
  observations: string;
  familyCooperation: string;
  safetyConcerns: string;
  followUp: string;
};

type ContributionFormState = {
  contributionType: string;
  amountPhp: number;
  estimatedValuePhp: number;
  programArea: string;
  description: string;
  contributionAt: string;
};

const emptyResidentForm: ResidentFormState = {
  codeName: '',
  safehouse: 'San Isidro House',
  caseCategory: 'Trafficking recovery',
  riskLevel: 'Medium',
  status: 'Active',
  assignedStaff: '',
  progressPercent: 50,
  nextReviewAt: '',
};

const emptyRecordingForm: RecordingFormState = {
  residentId: 1,
  sessionAt: new Date().toISOString(),
  staffName: '',
  sessionType: 'Individual',
  emotionalState: '',
  summary: '',
  interventions: '',
  followUp: '',
};

const emptyVisitationForm: VisitationFormState = {
  residentId: 1,
  visitAt: new Date().toISOString(),
  visitType: 'Routine follow-up',
  observations: '',
  familyCooperation: 'Moderate',
  safetyConcerns: '',
  followUp: '',
};

const emptyContributionForm: ContributionFormState = {
  contributionType: 'Monetary',
  amountPhp: 0,
  estimatedValuePhp: 0,
  programArea: 'Resident care',
  description: '',
  contributionAt: new Date().toISOString(),
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function toDateTimeLocal(value: string) {
  return value.slice(0, 16);
}

function residentToForm(resident: AdminPortalResident): ResidentFormState {
  return {
    codeName: resident.codeName,
    safehouse: resident.safehouse,
    caseCategory: resident.caseCategory,
    riskLevel: resident.riskLevel,
    status: resident.status,
    assignedStaff: resident.assignedStaff,
    progressPercent: resident.progressPercent,
    nextReviewAt: resident.nextReviewAt ? resident.nextReviewAt.slice(0, 10) : '',
  };
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminPortalOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedDonorId, setSelectedDonorId] = useState<number | null>(null);
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(null);
  const [editingResidentId, setEditingResidentId] = useState<number | null>(null);
  const [donorForm, setDonorForm] = useState<AdminPortalDonor | null>(null);
  const [residentForm, setResidentForm] = useState<ResidentFormState>(emptyResidentForm);
  const [recordingForm, setRecordingForm] = useState<RecordingFormState>(emptyRecordingForm);
  const [visitationForm, setVisitationForm] = useState<VisitationFormState>(emptyVisitationForm);
  const [contributionForm, setContributionForm] = useState<ContributionFormState>(emptyContributionForm);

  async function loadOverview() {
    try {
      setError(null);
      const data = await api.adminPortalOverview();
      setOverview(data);

      const firstDonor = data.donors[0] ?? null;
      const firstResident = data.residents[0] ?? null;

      setSelectedDonorId((current) => current ?? firstDonor?.id ?? null);
      setSelectedResidentId((current) => current ?? firstResident?.id ?? null);
      setDonorForm((current) => current ?? firstDonor);
      setResidentForm((current) => (editingResidentId === null && firstResident ? residentToForm(firstResident) : current));
      setRecordingForm((current) => ({ ...current, residentId: firstResident?.id ?? current.residentId }));
      setVisitationForm((current) => ({ ...current, residentId: firstResident?.id ?? current.residentId }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load the portal.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOverview();
  }, []);

  const selectedDonor = useMemo(
    () => overview?.donors.find((donor) => donor.id === selectedDonorId) ?? overview?.donors[0] ?? null,
    [overview, selectedDonorId],
  );

  const selectedResident = useMemo(
    () =>
      overview?.residents.find((resident) => resident.id === selectedResidentId) ??
      overview?.residents[0] ??
      null,
    [overview, selectedResidentId],
  );

  const residentRecordings = useMemo(
    () => overview?.recordings.filter((recording) => recording.residentId === selectedResident?.id) ?? [],
    [overview, selectedResident],
  );

  const residentVisitations = useMemo(
    () => overview?.visitations.filter((visitation) => visitation.residentId === selectedResident?.id) ?? [],
    [overview, selectedResident],
  );

  useEffect(() => {
    if (selectedDonor) {
      setDonorForm(selectedDonor);
    }
  }, [selectedDonor]);

  useEffect(() => {
    if (selectedResident) {
      setResidentForm(residentToForm(selectedResident));
      setRecordingForm((current) => ({ ...current, residentId: selectedResident.id }));
      setVisitationForm((current) => ({ ...current, residentId: selectedResident.id }));
    }
  }, [selectedResident]);

  async function refresh() {
    setLoading(true);
    await loadOverview();
  }

  async function handleDonorSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!donorForm) return;

    setSaving(true);
    try {
      await api.adminUpdateDonor(donorForm.id, {
        displayName: donorForm.displayName,
        donorType: donorForm.donorType,
        status: donorForm.status,
        preferredChannel: donorForm.preferredChannel,
        stewardshipLead: donorForm.stewardshipLead,
      });
      await refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update donor.');
    } finally {
      setSaving(false);
    }
  }

  async function handleContributionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDonor) return;

    setSaving(true);
    try {
      await api.adminAddContribution(selectedDonor.id, {
        contributionType: contributionForm.contributionType,
        amountPhp: contributionForm.amountPhp || null,
        estimatedValuePhp: contributionForm.estimatedValuePhp || null,
        programArea: contributionForm.programArea,
        description: contributionForm.description,
        contributionAt: contributionForm.contributionAt,
      });
      setContributionForm((current) => ({
        ...current,
        description: '',
        amountPhp: 0,
        estimatedValuePhp: 0,
      }));
      await refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to add contribution.');
    } finally {
      setSaving(false);
    }
  }

  async function handleResidentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    try {
      const payload = {
        codeName: residentForm.codeName,
        safehouse: residentForm.safehouse,
        caseCategory: residentForm.caseCategory,
        riskLevel: residentForm.riskLevel,
        status: residentForm.status,
        assignedStaff: residentForm.assignedStaff,
        progressPercent: residentForm.progressPercent,
        nextReviewAt: residentForm.nextReviewAt ? new Date(residentForm.nextReviewAt).toISOString() : null,
      };

      if (editingResidentId === null) {
        await api.adminAddResident(payload);
      } else {
        await api.adminUpdateResident(editingResidentId, payload);
      }

      setEditingResidentId(null);
      setResidentForm(emptyResidentForm);
      await refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save resident.');
    } finally {
      setSaving(false);
    }
  }

  async function handleResidentDelete(residentId: number) {
    if (!window.confirm('Delete this resident and associated notes?')) {
      return;
    }

    setSaving(true);
    try {
      await api.adminDeleteResident(residentId);
      if (selectedResidentId === residentId) {
        setSelectedResidentId(null);
      }
      await refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete resident.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRecordingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedResident) return;

    setSaving(true);
    try {
      await api.adminAddRecording({
        residentId: selectedResident.id,
        sessionAt: recordingForm.sessionAt,
        staffName: recordingForm.staffName,
        sessionType: recordingForm.sessionType,
        emotionalState: recordingForm.emotionalState,
        summary: recordingForm.summary,
        interventions: recordingForm.interventions,
        followUp: recordingForm.followUp,
      });
      setRecordingForm(emptyRecordingForm);
      await refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to add recording.');
    } finally {
      setSaving(false);
    }
  }

  async function handleVisitationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedResident) return;

    setSaving(true);
    try {
      await api.adminAddVisitation({
        residentId: selectedResident.id,
        visitAt: visitationForm.visitAt,
        visitType: visitationForm.visitType,
        observations: visitationForm.observations,
        familyCooperation: visitationForm.familyCooperation,
        safetyConcerns: visitationForm.safetyConcerns,
        followUp: visitationForm.followUp,
      });
      setVisitationForm(emptyVisitationForm);
      await refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to add visitation.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell title="Loading portal" subtitle="Fetching the latest authenticated staff data">
        <div className="admin-panel">Loading admin portal...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Admin Dashboard"
      subtitle="One workspace for the staff-only steps in the case brief"
    >
      {error ? <div className="admin-alert admin-alert-error">{error}</div> : null}

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">Step 1</p>
            <h2>Admin Dashboard</h2>
          </div>
          <span className="admin-chip">Live overview from the portal store</span>
        </div>

        <div className="admin-metric-grid">
          {overview?.dashboard.metrics.map((metric) => (
            <article key={metric.label} className="admin-card admin-metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </article>
          ))}
        </div>

        <div className="admin-split">
          <article className="admin-card">
            <h3>Alerts</h3>
            <div className="admin-stack">
              {overview?.dashboard.alerts.map((alert) => (
                <div key={`${alert.title}-${alert.detail}`} className={`admin-alert admin-alert-${alert.severity}`}>
                  <strong>{alert.title}</strong>
                  <p>{alert.detail}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-card">
            <h3>Recent activity</h3>
            <div className="admin-stack">
              {overview?.dashboard.recentActivity.map((activity) => (
                <div key={`${activity.activityAt}-${activity.label}`} className="admin-activity">
                  <strong>{activity.label}</strong>
                  <span>{formatDateTime(activity.activityAt)}</span>
                  <p>{activity.detail}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="admin-section" id="donors">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">Step 2</p>
            <h2>Donors and Contributions</h2>
          </div>
          <span className="admin-chip">Track supporter profiles and new gifts</span>
        </div>

        <div className="admin-split">
          <article className="admin-card">
            <h3>Supporters</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Total given</th>
                    <th>Last gift</th>
                  </tr>
                </thead>
                <tbody>
                  {overview?.donors.map((donor) => (
                    <tr
                      key={donor.id}
                      className={donor.id === selectedDonor?.id ? 'admin-row-active' : ''}
                      onClick={() => setSelectedDonorId(donor.id)}
                    >
                      <td>{donor.displayName}</td>
                      <td>{donor.donorType}</td>
                      <td>{donor.status}</td>
                      <td>{formatMoney(donor.totalGivenPhp)}</td>
                      <td>{formatDate(donor.lastDonationAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="admin-card">
            <h3>Update donor</h3>
            {donorForm ? (
              <form className="admin-form" onSubmit={handleDonorSubmit}>
                <label>
                  <span>Display name</span>
                  <input
                    value={donorForm.displayName}
                    onChange={(event) =>
                      setDonorForm((current) => (current ? { ...current, displayName: event.target.value } : current))
                    }
                  />
                </label>
                <label>
                  <span>Type</span>
                  <input
                    value={donorForm.donorType}
                    onChange={(event) =>
                      setDonorForm((current) => (current ? { ...current, donorType: event.target.value } : current))
                    }
                  />
                </label>
                <label>
                  <span>Status</span>
                  <input
                    value={donorForm.status}
                    onChange={(event) =>
                      setDonorForm((current) => (current ? { ...current, status: event.target.value } : current))
                    }
                  />
                </label>
                <label>
                  <span>Preferred channel</span>
                  <input
                    value={donorForm.preferredChannel}
                    onChange={(event) =>
                      setDonorForm((current) => (current ? { ...current, preferredChannel: event.target.value } : current))
                    }
                  />
                </label>
                <label>
                  <span>Stewardship lead</span>
                  <input
                    value={donorForm.stewardshipLead}
                    onChange={(event) =>
                      setDonorForm((current) => (current ? { ...current, stewardshipLead: event.target.value } : current))
                    }
                  />
                </label>
                <button type="submit" className="admin-button" disabled={saving}>
                  Save donor updates
                </button>
              </form>
            ) : null}

            <h3>New contribution</h3>
            <form className="admin-form" onSubmit={handleContributionSubmit}>
              <label>
                <span>Type</span>
                <input
                  value={contributionForm.contributionType}
                  onChange={(event) =>
                    setContributionForm((current) => ({ ...current, contributionType: event.target.value }))
                  }
                />
              </label>
              <div className="admin-form-row">
                <label>
                  <span>Amount PHP</span>
                  <input
                    type="number"
                    value={contributionForm.amountPhp}
                    onChange={(event) =>
                      setContributionForm((current) => ({ ...current, amountPhp: Number(event.target.value) }))
                    }
                  />
                </label>
                <label>
                  <span>Estimated value</span>
                  <input
                    type="number"
                    value={contributionForm.estimatedValuePhp}
                    onChange={(event) =>
                      setContributionForm((current) => ({
                        ...current,
                        estimatedValuePhp: Number(event.target.value),
                      }))
                    }
                  />
                </label>
              </div>
              <label>
                <span>Program area</span>
                <input
                  value={contributionForm.programArea}
                  onChange={(event) =>
                    setContributionForm((current) => ({ ...current, programArea: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  rows={3}
                  value={contributionForm.description}
                  onChange={(event) =>
                    setContributionForm((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Contribution date</span>
                <input
                  type="datetime-local"
                  value={toDateTimeLocal(contributionForm.contributionAt)}
                  onChange={(event) =>
                    setContributionForm((current) => ({
                      ...current,
                      contributionAt: new Date(event.target.value).toISOString(),
                    }))
                  }
                />
              </label>
              <button type="submit" className="admin-button" disabled={saving || !selectedDonor}>
                Add contribution
              </button>
            </form>
          </article>
        </div>

        <div className="admin-card admin-table-card">
          <h3>Recent contributions</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Program area</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {overview?.contributions.map((contribution) => (
                  <tr key={contribution.id}>
                    <td>{contribution.donorName}</td>
                    <td>{contribution.contributionType}</td>
                    <td>{formatMoney(contribution.amountPhp ?? contribution.estimatedValuePhp ?? 0)}</td>
                    <td>{contribution.programArea}</td>
                    <td>{formatDateTime(contribution.contributionAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="admin-section" id="residents">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">Step 3</p>
            <h2>Caseload Inventory</h2>
          </div>
          <span className="admin-chip">Searchable resident records with add and edit flows</span>
        </div>

        <div className="admin-split">
          <article className="admin-card">
            <h3>Residents</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code name</th>
                    <th>Safehouse</th>
                    <th>Status</th>
                    <th>Risk</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {overview?.residents.map((resident) => (
                    <tr
                      key={resident.id}
                      className={resident.id === selectedResident?.id ? 'admin-row-active' : ''}
                      onClick={() => setSelectedResidentId(resident.id)}
                    >
                      <td>{resident.codeName}</td>
                      <td>{resident.safehouse}</td>
                      <td>{resident.status}</td>
                      <td>{resident.riskLevel}</td>
                      <td>{resident.progressPercent}%</td>
                      <td>
                        <div className="admin-inline-actions">
                          <button
                            type="button"
                            className="admin-link-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditingResidentId(resident.id);
                              setResidentForm(residentToForm(resident));
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-link-button admin-link-danger"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleResidentDelete(resident.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="admin-card">
            <h3>{editingResidentId === null ? 'Add resident' : 'Edit resident'}</h3>
            <form className="admin-form" onSubmit={handleResidentSubmit}>
              <label>
                <span>Code name</span>
                <input
                  value={residentForm.codeName}
                  onChange={(event) => setResidentForm((current) => ({ ...current, codeName: event.target.value }))}
                />
              </label>
              <label>
                <span>Safehouse</span>
                <input
                  value={residentForm.safehouse}
                  onChange={(event) =>
                    setResidentForm((current) => ({ ...current, safehouse: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Case category</span>
                <input
                  value={residentForm.caseCategory}
                  onChange={(event) =>
                    setResidentForm((current) => ({ ...current, caseCategory: event.target.value }))
                  }
                />
              </label>
              <div className="admin-form-row">
                <label>
                  <span>Risk level</span>
                  <input
                    value={residentForm.riskLevel}
                    onChange={(event) =>
                      setResidentForm((current) => ({ ...current, riskLevel: event.target.value }))
                    }
                  />
                </label>
                <label>
                  <span>Status</span>
                  <input
                    value={residentForm.status}
                    onChange={(event) =>
                      setResidentForm((current) => ({ ...current, status: event.target.value }))
                    }
                  />
                </label>
              </div>
              <label>
                <span>Assigned staff</span>
                <input
                  value={residentForm.assignedStaff}
                  onChange={(event) =>
                    setResidentForm((current) => ({ ...current, assignedStaff: event.target.value }))
                  }
                />
              </label>
              <div className="admin-form-row">
                <label>
                  <span>Progress percent</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={residentForm.progressPercent}
                    onChange={(event) =>
                      setResidentForm((current) => ({
                        ...current,
                        progressPercent: Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Next review</span>
                  <input
                    type="date"
                    value={residentForm.nextReviewAt}
                    onChange={(event) =>
                      setResidentForm((current) => ({
                        ...current,
                        nextReviewAt: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <button type="submit" className="admin-button" disabled={saving}>
                {editingResidentId === null ? 'Add resident' : 'Save resident'}
              </button>
            </form>
          </article>
        </div>

        <div className="admin-card admin-table-card">
          <h3>Selected resident summary</h3>
          {selectedResident ? (
            <div className="admin-stack">
              <div className="admin-activity">
                <strong>{selectedResident.codeName}</strong>
                <span>
                  {selectedResident.safehouse} - {selectedResident.caseCategory} - {selectedResident.status}
                </span>
                <p>
                  Assigned to {selectedResident.assignedStaff} with {selectedResident.progressPercent}% progress.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="admin-section" id="recordings">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">Step 4</p>
            <h2>Process Recordings</h2>
          </div>
          <span className="admin-chip">Chronological counseling notes for each resident</span>
        </div>

        <div className="admin-split">
          <article className="admin-card">
            <h3>Resident timeline</h3>
            <label className="admin-select-row">
              <span>Resident</span>
              <select
                value={selectedResident?.id ?? ''}
                onChange={(event) => setSelectedResidentId(Number(event.target.value))}
              >
                {overview?.residents.map((resident) => (
                  <option key={resident.id} value={resident.id}>
                    {resident.codeName}
                  </option>
                ))}
              </select>
            </label>

            <div className="admin-stack">
              {residentRecordings.map((recording) => (
                <article key={recording.id} className="admin-timeline-card">
                  <div className="admin-timeline-topline">
                    <strong>{recording.sessionType}</strong>
                    <span>{formatDateTime(recording.sessionAt)}</span>
                  </div>
                  <p>{recording.summary}</p>
                  <small>
                    {recording.staffName} - {recording.emotionalState}
                  </small>
                </article>
              ))}
            </div>
          </article>

          <article className="admin-card">
            <h3>Add process recording</h3>
            <form className="admin-form" onSubmit={handleRecordingSubmit}>
              <label>
                <span>Resident</span>
                <select
                  value={recordingForm.residentId}
                  onChange={(event) =>
                    setRecordingForm((current) => ({ ...current, residentId: Number(event.target.value) }))
                  }
                >
                  {overview?.residents.map((resident) => (
                    <option key={resident.id} value={resident.id}>
                      {resident.codeName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Session date</span>
                <input
                  type="datetime-local"
                  value={toDateTimeLocal(recordingForm.sessionAt)}
                  onChange={(event) =>
                    setRecordingForm((current) => ({
                      ...current,
                      sessionAt: new Date(event.target.value).toISOString(),
                    }))
                  }
                />
              </label>
              <label>
                <span>Staff name</span>
                <input
                  value={recordingForm.staffName}
                  onChange={(event) =>
                    setRecordingForm((current) => ({ ...current, staffName: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Summary</span>
                <textarea
                  rows={3}
                  value={recordingForm.summary}
                  onChange={(event) =>
                    setRecordingForm((current) => ({ ...current, summary: event.target.value }))
                  }
                />
              </label>
              <button type="submit" className="admin-button" disabled={saving}>
                Save recording
              </button>
            </form>
          </article>
        </div>
      </section>

      <section className="admin-section" id="visitations">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">Step 5</p>
            <h2>Home Visitation and Case Conferences</h2>
          </div>
          <span className="admin-chip">Field visits and conference follow-up</span>
        </div>

        <div className="admin-split">
          <article className="admin-card">
            <h3>Visit history</h3>
            <div className="admin-stack">
              {residentVisitations.map((visitation) => (
                <article key={visitation.id} className="admin-timeline-card">
                  <div className="admin-timeline-topline">
                    <strong>{visitation.visitType}</strong>
                    <span>{formatDateTime(visitation.visitAt)}</span>
                  </div>
                  <p>{visitation.observations}</p>
                  <small>{visitation.familyCooperation} family cooperation</small>
                </article>
              ))}
            </div>
          </article>

          <article className="admin-card">
            <h3>Add visitation note</h3>
            <form className="admin-form" onSubmit={handleVisitationSubmit}>
              <label>
                <span>Resident</span>
                <select
                  value={visitationForm.residentId}
                  onChange={(event) =>
                    setVisitationForm((current) => ({ ...current, residentId: Number(event.target.value) }))
                  }
                >
                  {overview?.residents.map((resident) => (
                    <option key={resident.id} value={resident.id}>
                      {resident.codeName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Visit date</span>
                <input
                  type="datetime-local"
                  value={toDateTimeLocal(visitationForm.visitAt)}
                  onChange={(event) =>
                    setVisitationForm((current) => ({
                      ...current,
                      visitAt: new Date(event.target.value).toISOString(),
                    }))
                  }
                />
              </label>
              <label>
                <span>Visit type</span>
                <input
                  value={visitationForm.visitType}
                  onChange={(event) =>
                    setVisitationForm((current) => ({ ...current, visitType: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Safety concerns</span>
                <textarea
                  rows={3}
                  value={visitationForm.safetyConcerns}
                  onChange={(event) =>
                    setVisitationForm((current) => ({ ...current, safetyConcerns: event.target.value }))
                  }
                />
              </label>
              <button type="submit" className="admin-button" disabled={saving}>
                Save visitation
              </button>
            </form>
          </article>
        </div>
      </section>

      <section className="admin-section" id="reports">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">Step 6</p>
            <h2>Reports and Analytics</h2>
          </div>
          <span className="admin-chip">Operational reporting aligned to the brief</span>
        </div>

        <div className="admin-split">
          <article className="admin-card">
            <h3>Monthly trends</h3>
            <div className="admin-stack">
              {overview?.reports.monthlyTrends.map((trend) => (
                <div key={trend.monthLabel} className="admin-trend-row">
                  <div className="admin-trend-label">
                    <strong>{trend.monthLabel}</strong>
                    <span>{formatMoney(trend.donationsPhp)}</span>
                  </div>
                  <div className="admin-trend-bars">
                    <span>Residents {trend.activeResidents}</span>
                    <span>Recordings {trend.processRecordings}</span>
                    <span>Visits {trend.visitations}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-card">
            <h3>Program outcomes</h3>
            <div className="admin-stack">
              {overview?.reports.programOutcomes.map((outcome) => (
                <div key={outcome.programArea} className="admin-outcome-row">
                  <strong>{outcome.programArea}</strong>
                  <span>{outcome.value}</span>
                  <p>{outcome.outcome}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="admin-card admin-table-card">
          <h3>Safehouse comparison</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Safehouse</th>
                  <th>Occupancy</th>
                  <th>Active residents</th>
                  <th>High risk</th>
                </tr>
              </thead>
              <tbody>
                {overview?.reports.safehouseComparison.map((safehouse) => (
                  <tr key={safehouse.safehouse}>
                    <td>{safehouse.safehouse}</td>
                    <td>
                      {safehouse.occupancy}/{safehouse.capacity}
                    </td>
                    <td>{safehouse.activeResidents}</td>
                    <td>{safehouse.highRiskResidents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">Supporting tools</p>
            <h2>Jump to the existing admin pages</h2>
          </div>
        </div>
        <div className="admin-link-grid">
          <Link to="/admin/users" className="admin-link-card">
            <strong>User management</strong>
            <span>Roles, lockouts, and account removal</span>
          </Link>
          <Link to="/admin/query" className="admin-link-card">
            <strong>Database query</strong>
            <span>SELECT-only access for ad hoc review</span>
          </Link>
        </div>
      </section>
    </AdminShell>
  );
}
