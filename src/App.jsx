import React, { useEffect, useMemo, useState } from "react";
import { api, clearAuth, getStoredUser, saveAuth } from "./api";

const emptyForm = { workDate: "", week: 1, title: "", description: "" };

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "student@siwes.local",
    password: "password123",
    role: "student",
    department: "Computer Engineering",
    organization: "Astrovia Systems"
  });

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = authMode === "login"
        ? await api.login({ email: authForm.email, password: authForm.password })
        : await api.register(authForm);

      saveAuth(result.token, result.user);
      setUser(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearAuth();
    setUser(null);
  }

  if (!user) {
    return (
      <div className="shell auth-shell">
        <div className="auth-card">
          <div>
            <span className="pill">SIWES Logbook Management System</span>
            <h1>Full-Stack Starter</h1>
            <p className="muted">Login with a seed account or register a new user.</p>
          </div>

          <div className="tab-row">
            <button className={authMode === "login" ? "tab active" : "tab"} onClick={() => setAuthMode("login")}>Login</button>
            <button className={authMode === "register" ? "tab active" : "tab"} onClick={() => setAuthMode("register")}>Register</button>
          </div>

          <form onSubmit={handleAuthSubmit} className="form-grid">
            {authMode === "register" && (
              <label>
                Full Name
                <input value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
              </label>
            )}

            <label>
              Email
              <input value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
            </label>

            <label>
              Password
              <input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
            </label>

            {authMode === "register" && (
              <>
                <label>
                  Role
                  <select value={authForm.role} onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}>
                    <option value="student">Student</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <label>
                  Department
                  <input value={authForm.department} onChange={(e) => setAuthForm({ ...authForm, department: e.target.value })} />
                </label>

                <label>
                  Organization
                  <input value={authForm.organization} onChange={(e) => setAuthForm({ ...authForm, organization: e.target.value })} />
                </label>
              </>
            )}

            {error ? <p className="error">{error}</p> : null}
            <button className="primary" disabled={loading}>{loading ? "Please wait..." : authMode === "login" ? "Login" : "Create account"}</button>
          </form>

          <div className="seed-box">
            <strong>Seed accounts</strong>
            <div>Admin: admin@siwes.local / password123</div>
            <div>Supervisor: supervisor@siwes.local / password123</div>
            <div>Student: student@siwes.local / password123</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <span className="pill">Role: {user.role}</span>
          <h1>SIWES Logbook Dashboard</h1>
          <p className="muted">Welcome, {user.name}</p>
        </div>
        <button className="secondary" onClick={logout}>Logout</button>
      </header>

      {user.role === "student" && <StudentApp />}
      {user.role === "supervisor" && <SupervisorApp />}
      {user.role === "admin" && <AdminApp />}
    </div>
  );
}

function StudentApp() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function loadLogs() {
    const data = await api.getLogs();
    setLogs(data);
  }

  useEffect(() => {
    loadLogs().catch((err) => setMessage(err.message));
  }, []);

  const stats = useMemo(() => ({
    total: logs.length,
    approved: logs.filter((x) => x.status === "approved").length,
    pending: logs.filter((x) => x.status === "pending").length
  }), [logs]);

  async function submitLog(e) {
    e.preventDefault();
    setMessage("");
    try {
      if (editingId) {
        await api.updateLog(editingId, form);
        setMessage("Log updated.");
      } else {
        await api.createLog(form);
        setMessage("Log submitted.");
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadLogs();
    } catch (err) {
      setMessage(err.message);
    }
  }

  function beginEdit(log) {
    setEditingId(log.id);
    setForm({
      workDate: log.workDate,
      week: log.week,
      title: log.title,
      description: log.description
    });
  }

  async function removeLog(id) {
    try {
      await api.deleteLog(id);
      setMessage("Log deleted.");
      await loadLogs();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <main className="grid two">
      <section className="card">
        <h2>Student Overview</h2>
        <div className="stats">
          <Stat title="Total Entries" value={stats.total} />
          <Stat title="Approved" value={stats.approved} />
          <Stat title="Pending" value={stats.pending} />
        </div>

        <form className="form-grid" onSubmit={submitLog}>
          <label>
            Work Date
            <input type="date" value={form.workDate} onChange={(e) => setForm({ ...form, workDate: e.target.value })} required />
          </label>
          <label>
            Week
            <input type="number" min="1" max="24" value={form.week} onChange={(e) => setForm({ ...form, week: Number(e.target.value) })} required />
          </label>
          <label className="full">
            Title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label className="full">
            Description
            <textarea rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </label>

          {message ? <p className="info full">{message}</p> : null}

          <div className="row full">
            <button className="primary">{editingId ? "Update Entry" : "Submit Entry"}</button>
            {editingId ? <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <h2>My Log Entries</h2>
        <div className="stack">
          {logs.map((log) => (
            <article key={log.id} className="log-card">
              <div className="row split">
                <strong>{log.title}</strong>
                <span className={`badge ${log.status}`}>{log.status}</span>
              </div>
              <div className="muted small">{log.workDate} • Week {log.week}</div>
              <p>{log.description}</p>
              <div className="feedback"><strong>Feedback:</strong> {log.feedback || "No feedback yet"}</div>
              <div className="row">
                {log.status === "pending" && <button className="secondary" onClick={() => beginEdit(log)}>Edit</button>}
                {log.status === "pending" && <button className="danger" onClick={() => removeLog(log.id)}>Delete</button>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function SupervisorApp() {
  const [queue, setQueue] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [message, setMessage] = useState("");

  async function loadQueue() {
    const data = await api.getSupervisorQueue();
    setQueue(data);
  }

  useEffect(() => {
    loadQueue().catch((err) => setMessage(err.message));
  }, []);

  async function review(id, status) {
    try {
      await api.reviewLog(id, { status, feedback: feedbackMap[id] || "" });
      setMessage(`Entry ${status}.`);
      await loadQueue();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <main className="card">
      <h2>Supervisor Review Queue</h2>
      {message ? <p className="info">{message}</p> : null}
      <div className="stack">
        {queue.map((log) => (
          <article key={log.id} className="log-card">
            <div className="row split">
              <strong>{log.title}</strong>
              <span className="badge pending">pending</span>
            </div>
            <div className="muted small">{log.studentName} • {log.workDate} • Week {log.week}</div>
            <p>{log.description}</p>
            <label>
              Feedback
              <textarea
                rows="3"
                value={feedbackMap[log.id] || ""}
                onChange={(e) => setFeedbackMap({ ...feedbackMap, [log.id]: e.target.value })}
              />
            </label>
            <div className="row">
              <button className="primary" onClick={() => review(log.id, "approved")}>Approve</button>
              <button className="danger" onClick={() => review(log.id, "rejected")}>Reject</button>
            </div>
          </article>
        ))}
        {queue.length === 0 ? <p className="muted">No pending entries.</p> : null}
      </div>
    </main>
  );
}

function AdminApp() {
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([api.getAdminStudents(), api.getAdminSummary()])
      .then(([studentData, summaryData]) => {
        setStudents(studentData);
        setSummary(summaryData);
      })
      .catch((err) => setMessage(err.message));
  }, []);

  return (
    <main className="grid two">
      <section className="card">
        <h2>Admin Summary</h2>
        {message ? <p className="info">{message}</p> : null}
        {summary ? (
          <div className="stats">
            <Stat title="Students" value={summary.students} />
            <Stat title="Supervisors" value={summary.supervisors} />
            <Stat title="Logs" value={summary.logs} />
            <Stat title="Pending" value={summary.pending} />
            <Stat title="Approved" value={summary.approved} />
            <Stat title="Rejected" value={summary.rejected} />
          </div>
        ) : <p className="muted">Loading summary...</p>}
      </section>

      <section className="card">
        <h2>Registered Students</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Organization</th>
                <th>Supervisor</th>
                <th>Entries</th>
                <th>Approved</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.department || "-"}</td>
                  <td>{student.organization || "-"}</td>
                  <td>{student.supervisorName || "-"}</td>
                  <td>{student.entryCount}</td>
                  <td>{student.approvedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Stat({ title, value }) {
  return (
    <div className="stat">
      <div className="small muted">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
