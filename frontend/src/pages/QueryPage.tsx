import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { type QueryResult } from '../api';
import './AdminPage.css';
import './QueryPage.css';

const EXAMPLE_QUERIES = [
  'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_NAME',
  'SELECT TOP 10 * FROM AspNetUsers',
  'SELECT TOP 20 * FROM AspNetRoles',
];

export default function QueryPage() {
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sql.trim()) return;

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.adminQuery(sql);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div>
            <Link to="/" className="admin-back">← Home</Link>
            <h1>Database Query</h1>
          </div>
          <Link to="/admin/users" className="admin-nav-link">User Management →</Link>
        </div>
      </header>

      <main className="admin-main">
        <div className="query-examples">
          <span className="query-examples-label">Examples:</span>
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              className="query-example-btn"
              onClick={() => setSql(q)}
            >
              {q.length > 50 ? q.slice(0, 50) + '…' : q}
            </button>
          ))}
        </div>

        <form className="query-form" onSubmit={handleSubmit}>
          <textarea
            className="query-textarea"
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="SELECT * FROM AspNetUsers"
            rows={6}
            spellCheck={false}
          />
          <div className="query-form-footer">
            <span className="query-hint">SELECT only · max 500 rows</span>
            <button type="submit" className="query-run-btn" disabled={running || !sql.trim()}>
              {running ? 'Running…' : 'Run query'}
            </button>
          </div>
        </form>

        {error !== null && <div className="admin-error">{error}</div>}

        {result !== null && (
          <div className="query-results">
            <div className="query-results-meta">
              {result.rows.length} row{result.rows.length !== 1 ? 's' : ''}
              {result.rows.length === 500 ? ' (capped at 500)' : ''}
            </div>
            <div className="query-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    {result.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>{cell === null ? <span className="null-cell">NULL</span> : String(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
