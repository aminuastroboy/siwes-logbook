import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  UserCog,
  Users,
  Download,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const STORAGE_KEYS = {
  auth: 'siwes_demo_auth',
  entries: 'siwes_demo_entries',
  queue: 'siwes_demo_queue',
  students: 'siwes_demo_students',
};

const defaultEntries = [
  { id: 1, date: '2026-04-01', title: 'Configured office LAN switches', description: 'Observed VLAN setup and documented switch port assignments.', status: 'Approved', feedback: 'Well documented.', week: 1 },
  { id: 2, date: '2026-04-02', title: 'System maintenance', description: 'Performed OS updates and antivirus scan on workstation units.', status: 'Pending', feedback: '', week: 1 },
  { id: 3, date: '2026-04-03', title: 'Database backup routine', description: 'Assisted with scheduled backup verification and restore test.', status: 'Rejected', feedback: 'Add clearer outcome and tools used.', week: 1 },
];

const defaultStudents = [
  { id: 'ST-001', name: 'Aminu Muhammad', dept: 'Computer Engineering', company: 'Astrovia Systems', progress: 72, entries: 18, approved: 14 },
  { id: 'ST-002', name: 'Maryam Sani', dept: 'Computer Engineering', company: 'TechBridge Ltd', progress: 58, entries: 14, approved: 11 },
  { id: 'ST-003', name: 'Ibrahim Musa', dept: 'Computer Engineering', company: 'NetCore Hub', progress: 83, entries: 22, approved: 19 },
];

const defaultQueue = [
  { id: 'LG-101', student: 'Aminu Muhammad', date: '2026-04-02', title: 'System maintenance', status: 'Pending', feedback: '' },
  { id: 'LG-108', student: 'Maryam Sani', date: '2026-04-03', title: 'CCTV configuration', status: 'Pending', feedback: '' },
  { id: 'LG-115', student: 'Ibrahim Musa', date: '2026-04-04', title: 'API testing', status: 'Pending', feedback: '' },
];

const demoUsers = {
  student: { email: 'student@siwes.demo', password: '123456', name: 'Aminu Muhammad' },
  supervisor: { email: 'supervisor@siwes.demo', password: '123456', name: 'Engr. Fatima Bello' },
  admin: { email: 'admin@siwes.demo', password: '123456', name: 'SIWES Coordinator' },
};

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function Card({ children, className = '' }) {
  return <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

function StatCard({ title, value, icon: Icon, hint }) {
  return (
    <Card>
      <div className="p-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-semibold mt-1 text-slate-900">{value}</h3>
          <p className="text-xs text-slate-500 mt-1">{hint}</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </Card>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 2400);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;
  return <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-lg text-sm">{message}</div>;
}

function Badge({ type = 'secondary', children }) {
  const classes = {
    default: 'bg-emerald-100 text-emerald-700',
    destructive: 'bg-red-100 text-red-700',
    secondary: 'bg-slate-100 text-slate-700',
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${classes[type]}`}>{children}</span>;
}

function Progress({ value }) {
  return (
    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full rounded-full bg-slate-900" style={{ width: `${value}%` }} />
    </div>
  );
}

function Input(props) {
  return <input {...props} className={`w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-slate-300 ${props.className || ''}`} />;
}

function Textarea(props) {
  return <textarea {...props} className={`w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-slate-300 ${props.className || ''}`} />;
}

function Button({ children, variant = 'default', className = '', ...props }) {
  const styles = {
    default: 'bg-slate-900 text-white hover:bg-slate-800',
    outline: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50',
    destructive: 'bg-red-600 text-white hover:bg-red-500',
  };
  return <button {...props} className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition ${styles[variant]} ${className}`}>{children}</button>;
}

function Select({ value, onChange, options, className = '' }) {
  return (
    <select value={value} onChange={onChange} className={`w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-slate-300 ${className}`}>
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );
}

function LoginPage({ onLogin }) {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState(demoUsers.student.email);
  const [password, setPassword] = useState(demoUsers.student.password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setEmail(demoUsers[role].email);
    setPassword(demoUsers[role].password);
  }, [role]);

  const handleLogin = () => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      const account = demoUsers[role];
      if (email === account.email && password === account.password) {
        onLogin({ role, name: account.name, email: account.email });
      } else {
        setError('Invalid demo credentials. Use the prefilled account.');
      }
      setLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl overflow-hidden">
        <div className="grid lg:grid-cols-[1.05fr_.95fr]">
          <div className="bg-slate-900 text-white p-8 md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm border border-white/10">
              <ShieldCheck className="h-4 w-4" />
              SIWES Logbook Demo
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mt-6 leading-tight">Defense-ready frontend prototype for your SIWES management system</h1>
            <p className="text-slate-300 mt-4 leading-7">This demo simulates the full workflow for students, supervisors, and administrators with persistent local data, interactive actions, analytics, and realistic dashboard behavior.</p>
            <div className="mt-8 grid sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-4">Student log submission</div>
              <div className="rounded-2xl bg-white/10 p-4">Supervisor review workflow</div>
              <div className="rounded-2xl bg-white/10 p-4">Admin monitoring dashboard</div>
            </div>
          </div>
          <div className="p-8 md:p-10 bg-white">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">Sign in to demo</h2>
              <p className="text-slate-500 mt-2">Choose a role and use the prefilled credentials.</p>
            </div>
            <div className="space-y-4">
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                options={[
                  { value: 'student', label: 'Student Demo' },
                  { value: 'supervisor', label: 'Supervisor Demo' },
                  { value: 'admin', label: 'Administrator Demo' },
                ]}
              />
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button className="w-full" onClick={handleLogin} disabled={loading}>{loading ? 'Signing in...' : 'Login to Dashboard'}</Button>
            </div>
            <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900 mb-2">Demo credentials</p>
              <p>Student: student@siwes.demo / 123456</p>
              <p>Supervisor: supervisor@siwes.demo / 123456</p>
              <p>Admin: admin@siwes.demo / 123456</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function exportEntriesPdf(entries) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>SIWES Logbook</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{font-size:24px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f5f5f5}</style></head><body><h1>SIWES Logbook Report</h1><p>Generated from frontend demo.</p><table><thead><tr><th>Date</th><th>Week</th><th>Title</th><th>Status</th><th>Feedback</th></tr></thead><tbody>${entries.map(e => `<tr><td>${e.date}</td><td>${e.week}</td><td>${e.title}</td><td>${e.status}</td><td>${e.feedback || ''}</td></tr>`).join('')}</tbody></table></body></html>`;
  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
  return true;
}

function StudentDashboard({ entries, setEntries, notify }) {
  const [form, setForm] = useState({ date: '', title: '', description: '', week: '1' });
  const [loading, setLoading] = useState(false);
  const total = entries.length;
  const approved = entries.filter((e) => e.status === 'Approved').length;
  const pending = entries.filter((e) => e.status === 'Pending').length;

  const chartData = [
    { name: 'Approved', value: approved },
    { name: 'Pending', value: pending },
    { name: 'Rejected', value: entries.filter((e) => e.status === 'Rejected').length },
  ];

  const submitEntry = () => {
    if (!form.date || !form.title || !form.description) {
      notify('Please complete all log entry fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setEntries([
        { id: Date.now(), date: form.date, title: form.title, description: form.description, week: Number(form.week), status: 'Pending', feedback: 'Awaiting supervisor review.' },
        ...entries,
      ]);
      setForm({ date: '', title: '', description: '', week: '1' });
      setLoading(false);
      notify('Log entry submitted successfully.');
    }, 650);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Total Entries" value={total} icon={ClipboardList} hint="Daily and weekly log submissions" />
        <StatCard title="Approved" value={approved} icon={CheckCircle2} hint="Reviewed by supervisor" />
        <StatCard title="Pending Review" value={pending} icon={CalendarDays} hint="Awaiting feedback" />
      </div>

      <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-6">
        <Card>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Submit Log Entry</h3>
              <p className="text-slate-500 mt-1">Capture today’s SIWES activity with enough technical detail.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <Select value={form.week} onChange={(e) => setForm({ ...form, week: e.target.value })} options={Array.from({ length: 24 }).map((_, i) => ({ value: String(i + 1), label: `Week ${i + 1}` }))} />
            </div>
            <Input placeholder="Activity title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Describe what was done, tools used, outcome, and lessons learned" className="min-h-36" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-3 flex-wrap">
              <Button onClick={submitEntry} disabled={loading}>{loading ? 'Submitting...' : 'Submit Entry'}</Button>
              <Button variant="outline" onClick={() => notify('Evidence upload can be connected to backend later.')}>Attach Evidence</Button>
              <Button variant="outline" onClick={() => exportEntriesPdf(entries) ? notify('Print dialog opened for PDF export.') : notify('Allow popups to export PDF.') }><Download className="h-4 w-4" /> Export PDF</Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Internship Progress</h3>
              <p className="text-slate-500 mt-1">Track completion and approval rate.</p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span>Overall completion</span><span>68%</span></div>
              <Progress value={68} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span>Supervisor approval rate</span><span>{total ? Math.round((approved / total) * 100) : 0}%</span></div>
              <Progress value={total ? Math.round((approved / total) * 100) : 0} />
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900 mb-2">Latest supervisor note</p>
              <p>Make each entry more outcome-focused. Mention tools, devices, or software used for each task.</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={80}>
                    <Cell fill="#111827" />
                    <Cell fill="#94a3b8" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-slate-900">Recent Entries</h3>
            <p className="text-slate-500 mt-1">Review submission status and feedback.</p>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                  <th className="py-3 pr-4">Date</th><th className="py-3 pr-4">Title</th><th className="py-3 pr-4">Week</th><th className="py-3 pr-4">Status</th><th className="py-3">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-100 align-top">
                    <td className="py-3 pr-4 text-sm">{entry.date}</td>
                    <td className="py-3 pr-4 text-sm">{entry.title}</td>
                    <td className="py-3 pr-4 text-sm">{entry.week}</td>
                    <td className="py-3 pr-4 text-sm"><Badge type={entry.status === 'Approved' ? 'default' : entry.status === 'Rejected' ? 'destructive' : 'secondary'}>{entry.status}</Badge></td>
                    <td className="py-3 text-sm text-slate-600">{entry.feedback || 'No feedback yet'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}

function SupervisorDashboard({ queue, setQueue, notify }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [feedbacks, setFeedbacks] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const filtered = useMemo(() => selectedStatus === 'all' ? queue : queue.filter((item) => item.status.toLowerCase() === selectedStatus), [selectedStatus, queue]);

  const handleDecision = (id, status) => {
    setLoadingId(id);
    setTimeout(() => {
      setQueue(queue.map((item) => item.id === id ? { ...item, status, feedback: feedbacks[id] || `${status} by supervisor.` } : item));
      setLoadingId(null);
      notify(`Entry ${id} ${status.toLowerCase()}.`);
    }, 700);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Assigned Students" value="24" icon={Users} hint="Across active organizations" />
        <StatCard title="Pending Reviews" value={queue.filter((q) => q.status === 'Pending').length} icon={FileText} hint="Need immediate supervisor action" />
        <StatCard title="Weekly Evaluations" value="5" icon={ShieldCheck} hint="Submitted this week" />
      </div>
      <Card>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Review Queue</h3>
            <p className="text-slate-500 mt-1">Approve, reject, and comment on submitted entries.</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Search student or activity" />
            </div>
            <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-44" options={[{ value: 'all', label: 'All statuses' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]} />
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead><tr className="border-b border-slate-200 text-left text-sm text-slate-500"><th className="py-3 pr-4">Entry ID</th><th className="py-3 pr-4">Student</th><th className="py-3 pr-4">Date</th><th className="py-3 pr-4">Activity</th><th className="py-3 pr-4">Status</th><th className="py-3">Action</th></tr></thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 align-top">
                    <td className="py-3 pr-4 text-sm">{item.id}</td>
                    <td className="py-3 pr-4 text-sm">{item.student}</td>
                    <td className="py-3 pr-4 text-sm">{item.date}</td>
                    <td className="py-3 pr-4 text-sm">{item.title}</td>
                    <td className="py-3 pr-4 text-sm"><Badge type={item.status === 'Pending' ? 'secondary' : item.status === 'Approved' ? 'default' : 'destructive'}>{item.status}</Badge></td>
                    <td className="py-3 text-sm">
                      <div className="flex gap-2 flex-wrap">
                        <Button className="px-3 py-2 text-sm" disabled={loadingId === item.id} onClick={() => handleDecision(item.id, 'Approved')}>{loadingId === item.id ? 'Saving...' : 'Approve'}</Button>
                        <Button variant="destructive" className="px-3 py-2 text-sm" disabled={loadingId === item.id} onClick={() => handleDecision(item.id, 'Rejected')}>Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3">
            {filtered.map((item) => (
              <div key={`${item.id}-feedback`} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-medium mb-2">Feedback for {item.id} — {item.student}</p>
                <Textarea className="min-h-20" placeholder="Write supervisor comment" value={feedbacks[item.id] || item.feedback || ''} onChange={(e) => setFeedbacks({ ...feedbacks, [item.id]: e.target.value })} />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function AdminDashboard({ students, notify }) {
  const chartData = students.map((student) => ({ name: student.name.split(' ')[0], progress: student.progress, approved: student.approved }));
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Students" value="312" icon={Users} hint="Registered on the platform" />
        <StatCard title="Supervisors" value="48" icon={UserCog} hint="Industry and school supervisors" />
        <StatCard title="Departments" value="6" icon={LayoutDashboard} hint="Currently onboarded" />
        <StatCard title="Submission Rate" value="84%" icon={ClipboardList} hint="Average weekly compliance" />
      </div>
      <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-6">
        <Card>
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-slate-900">Student Monitoring</h3>
              <p className="text-slate-500 mt-1">Overview of active SIWES students and progress.</p>
            </div>
            <div className="overflow-x-auto">
              <table>
                <thead><tr className="border-b border-slate-200 text-left text-sm text-slate-500"><th className="py-3 pr-4">ID</th><th className="py-3 pr-4">Name</th><th className="py-3 pr-4">Company</th><th className="py-3 pr-4">Progress</th><th className="py-3 pr-4">Entries</th><th className="py-3">Approved</th></tr></thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-4 text-sm">{student.id}</td>
                      <td className="py-3 pr-4 text-sm">{student.name}</td>
                      <td className="py-3 pr-4 text-sm">{student.company}</td>
                      <td className="py-3 pr-4 text-sm w-52"><div className="space-y-2"><Progress value={student.progress} /><span className="text-xs text-slate-500">{student.progress}%</span></div></td>
                      <td className="py-3 pr-4 text-sm">{student.entries}</td>
                      <td className="py-3 text-sm">{student.approved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6 space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Admin Actions</h3>
              <p className="text-slate-500 mt-1">Core system administration actions.</p>
            </div>
            <Button className="justify-start" onClick={() => notify('Student registration form can be connected next.')}>Register New Student</Button>
            <Button variant="outline" className="justify-start" onClick={() => notify('Supervisor assignment module ready for backend integration.')}>Assign Supervisor</Button>
            <Button variant="outline" className="justify-start" onClick={() => notify('Faculty report generated successfully.')}>Generate Faculty Report</Button>
            <Button variant="outline" className="justify-start" onClick={() => notify('Evaluation data exported.')}>Export Evaluation Data</Button>
            <Button variant="outline" className="justify-start" onClick={() => notify('Department management page can be added next.')}>Manage Departments</Button>
          </div>
        </Card>
      </div>
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4 text-slate-900"><BarChart3 className="h-5 w-5" /><h3 className="text-xl font-semibold">Analytics Overview</h3></div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill="#111827" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState(defaultEntries);
  const [queue, setQueue] = useState(defaultQueue);
  const [students, setStudents] = useState(defaultStudents);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setUser(readStorage(STORAGE_KEYS.auth, null));
    setEntries(readStorage(STORAGE_KEYS.entries, defaultEntries));
    setQueue(readStorage(STORAGE_KEYS.queue, defaultQueue));
    setStudents(readStorage(STORAGE_KEYS.students, defaultStudents));
  }, []);

  useEffect(() => { writeStorage(STORAGE_KEYS.auth, user); }, [user]);
  useEffect(() => { writeStorage(STORAGE_KEYS.entries, entries); }, [entries]);
  useEffect(() => { writeStorage(STORAGE_KEYS.queue, queue); }, [queue]);
  useEffect(() => { writeStorage(STORAGE_KEYS.students, students); }, [students]);

  const notify = (message) => setToast(message);

  const resetDemo = () => {
    localStorage.removeItem(STORAGE_KEYS.entries);
    localStorage.removeItem(STORAGE_KEYS.queue);
    localStorage.removeItem(STORAGE_KEYS.students);
    setEntries(defaultEntries);
    setQueue(defaultQueue);
    setStudents(defaultStudents);
    notify('Demo data has been reset.');
  };

  if (!user) {
    return <><LoginPage onLogin={(profile) => { setUser(profile); notify(`Welcome, ${profile.name}.`); }} /><Toast message={toast} onClose={() => setToast('')} /></>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm shadow-sm border border-slate-200">
              <ShieldCheck className="h-4 w-4" />
              SIWES Logbook Management System
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mt-3">Frontend Demo Upgrade</h1>
            <p className="text-slate-600 mt-2 max-w-3xl">Interactive role-based demo with login simulation, local persistence, workflow actions, analytics, and dashboard navigation.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Card>
              <div className="p-4">
                <p className="text-sm text-slate-500">Signed in as</p>
                <p className="font-semibold mt-1">{user.name}</p>
                <p className="text-xs text-slate-500 mt-1 capitalize">{user.role}</p>
              </div>
            </Card>
            <Button variant="outline" onClick={resetDemo}>Reset Demo Data</Button>
            <Button variant="destructive" onClick={() => setUser(null)}><LogOut className="h-4 w-4" /> Logout</Button>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button variant={user.role === 'student' ? 'default' : 'outline'} onClick={() => setUser({ ...user, role: 'student', name: demoUsers.student.name, email: demoUsers.student.email })}>Student</Button>
          <Button variant={user.role === 'supervisor' ? 'default' : 'outline'} onClick={() => setUser({ ...user, role: 'supervisor', name: demoUsers.supervisor.name, email: demoUsers.supervisor.email })}>Supervisor</Button>
          <Button variant={user.role === 'admin' ? 'default' : 'outline'} onClick={() => setUser({ ...user, role: 'admin', name: demoUsers.admin.name, email: demoUsers.admin.email })}>Admin</Button>
        </div>

        {user.role === 'student' && <StudentDashboard entries={entries} setEntries={setEntries} notify={notify} />}
        {user.role === 'supervisor' && <SupervisorDashboard queue={queue} setQueue={setQueue} notify={notify} />}
        {user.role === 'admin' && <AdminDashboard students={students} notify={notify} />}
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
