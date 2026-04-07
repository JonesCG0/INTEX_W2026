import { useEffect, useState } from 'react';
import api, { type UserSummary } from '../api';
import { AdminShell } from '../components/AdminShell';
import './AdminPage.css';

export default function AdminPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null); // id of row being mutated
  const [confirmDelete, setConfirmDelete] = useState<UserSummary | null>(null);

  async function loadUsers() {
    try {
      setError(null);
      const data = await api.adminGetUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadUsers(); }, []);

  async function handleRoleChange(user: UserSummary, newRole: string) {
    setBusy(user.id);
    try {
      await api.adminChangeRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change role.');
    } finally {
      setBusy(null);
    }
  }

  async function handleUnlock(user: UserSummary) {
    setBusy(user.id);
    try {
      await api.adminUnlockUser(user.id);
      setUsers((prev) => prev.map((u) =>
        u.id === user.id ? { ...u, lockoutEnd: null, accessFailedCount: 0 } : u
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock user.');
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(user: UserSummary) {
    setConfirmDelete(null);
    setBusy(user.id);
    try {
      await api.adminDeleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user.');
    } finally {
      setBusy(null);
    }
  }

  const isLocked = (u: UserSummary) =>
    u.lockoutEnd !== null && new Date(u.lockoutEnd) > new Date();

  return (
    <AdminShell title="User Management" subtitle="Change roles, unlock accounts, and remove access">
      <div className="admin-page">
        <main className="admin-main">
        {error !== null && (
          <div className="admin-error">{error}</div>
        )}

        {loading ? (
          <div className="admin-loading">Loading users...</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Display Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={isLocked(user) ? 'row-locked' : ''}>
                    <td>{user.email}</td>
                    <td>{user.displayName}</td>
                    <td>
                      <select
                        value={user.role}
                        disabled={busy === user.id}
                        onChange={(e) => void handleRoleChange(user, e.target.value)}
                        className="admin-role-select"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Donor">Donor</option>
                      </select>
                    </td>
                    <td>
                      {isLocked(user) ? (
                        <span className="badge badge-locked">Locked</span>
                      ) : user.accessFailedCount > 0 ? (
                        <span className="badge badge-warn">{user.accessFailedCount} failed</span>
                      ) : (
                        <span className="badge badge-ok">Active</span>
                      )}
                    </td>
                    <td className="admin-actions">
                      {isLocked(user) && (
                        <button
                          className="btn-action btn-unlock"
                          disabled={busy === user.id}
                          onClick={() => void handleUnlock(user)}
                        >
                          Unlock
                        </button>
                      )}
                      <button
                        className="btn-action btn-delete"
                        disabled={busy === user.id}
                        onClick={() => setConfirmDelete(user)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </main>

        {/* Delete confirmation modal */}
        {confirmDelete !== null && (
          <div className="admin-modal-backdrop" onClick={() => setConfirmDelete(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Delete account?</h2>
              <p>
                This will permanently delete <strong>{confirmDelete.email}</strong>. This action
                cannot be undone.
              </p>
              <div className="admin-modal-actions">
                <button className="btn-action" onClick={() => setConfirmDelete(null)}>
                  Cancel
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => void handleDelete(confirmDelete)}
                >
                  Yes, delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
