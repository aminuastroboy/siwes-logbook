import React, { useEffect, useMemo, useState } from 'react'
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
} from 'lucide-react'

const STORAGE_KEYS = {
  auth: 'siwes_demo_auth',
  entries: 'siwes_demo_entries',
  queue: 'siwes_demo_queue',
  students: 'siwes_demo_students',
}

const defaultEntries = [
  { id: 1, date: '2026-04-01', title: 'Configured office LAN switches', description: 'Observed VLAN setup and documented switch port assignments.', status: 'Approved', feedback: 'Well documented.', week: 1 },
  { id: 2, date: '2026-04-02', title: 'System maintenance', description: 'Performed OS updates and antivirus scan on workstation units.', status: 'Pending', feedback: '', week: 1 },
  { id: 3, date: '2026-04-03', title: 'Database backup routine', description: 'Assisted with scheduled backup verification and restore test.', status: 'Rejected', feedback: 'Add clearer outcome and tools used.', week: 1 },
]

const defaultStudents = [
  { id: 'ST-001', name: 'Aminu Muhammad', dept: 'Computer Engineering', company: 'Astrovia Systems', progress: 72, entries: 18, approved: 14 },
  { id: 'ST-002', name: 'Maryam Sani', dept: 'Computer Engineering', company: 'TechBridge Ltd', progress: 58, entries: 14, approved: 11 },
  { id: 'ST-003', name: 'Ibrahim Musa', dept: 'Computer Engineering', company: 'NetCore Hub', progress: 83, entries: 22, approved: 19 },
]

const defaultQueue = [
  { id: 'LG-101', student: 'Aminu Muhammad', date: '2026-04-02', title: 'System maintenance', status: 'Pending', feedback: '' },
  { id: 'LG-108', student: 'Maryam Sani', date: '2026-04-03', title: 'CCTV configuration', status: 'Pending', feedback: '' },
  { id: 'LG-115', student: 'Ibrahim Musa', date: '2026-04-04', title: 'API testing', status: 'Pending', feedback: '' },
]

const demoUsers = {
  student: { email: 'student@siwes.demo', password: '123456', name: 'Aminu Muhammad' },
  supervisor: { email: 'supervisor@siwes.demo', password: '123456', name: 'Engr. Fatima Bello' },
  admin: { email: 'admin@siwes.demo', password: '123456', name: 'SIWES Coordinator' },
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function Card({ children, className = '' }) {
  return <div className={`bg-white border border-slate-200 rounded-3xl card-shadow ${className}`}>{children}</div>
}

function Button({ children, variant = 'default', className = '', ...props }) {
  const styles = {
    default: 'bg-slate-900 text-white hover:bg-slate-800',
    outline: 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  }
  return <button className={`inline-flex items-center justify-center px-4 py-2.5 rounded-2xl font-medium transition ${styles[variant]} ${className}`} {...props}>{children}</button>
}

function Input(props) {
  return <input className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300" {...props} />
}

function Textarea(props) {
  return <textarea className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300" {...props} />
}

function Select({ children, className = '', ...props }) {
  return <select className={`w-full rounded-2xl border border-slate-300 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-slate-300 ${className}`} {...props}>{children}</select>
}

function Badge({ children, tone = 'secondary' }) {
  const tones = {
    default: 'bg-emerald-100 text-emerald-700',
    destructive: 'bg-red-100 text-red-700',
    secondary: 'bg-slate-100 text-slate-700',
  }
  return <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

function StatCard({ title, value, icon: Icon, hint }) {
  return (
    <Card>
      <div className="p-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          <p className="text-xs text-slate-500 mt-1">{hint}</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-100">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

function ProgressBar({ value }) {
  return (
    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
      <div className="h-full bg-slate-900 rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, 2400)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null
  return <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-lg text-sm">{message}</div>
}

function LoginPage({ onLogin }) {
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState(demoUsers.student.email)
  const [password, setPassword] = useState(demoUsers.student.password)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setEmail(demoUsers[role].email)
    setPassword(demoUsers[role].password)
  }, [role])

  const handleLogin = () => {
    setError('')
    setLoading(true)
    setTimeout(() => {
      const account = demoUsers[role]
      if (email === account.email && password === account.password) {
        onLogin({ role, name: account.name, email: account.email })
      } else {
        setError('Invalid demo credentials. Use the prefilled account.')
      }
      setLoading(false)
    }, 700)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl overflow-hidden">
        <div className="grid lg:grid-cols-[1.05fr_.95fr]">
          <div className="bg-slate-900 text-white p-8 md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm border border-white/10">
              <ShieldCheck className="h-4 w-4" />
              SIWES Logbook Demo
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mt-6 leading-tight">Defense-ready frontend prototype for your SIWES management system</h1>
            <p className="text-slate-300 mt-4 leading-7">
              This demo simulates the full workflow for students, supervisors, and administrators with persistent local data, interactive actions, and realistic dashboard behavior.
            </p>
            <div className="mt-8 grid sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-4">Student log submission</div>
              <div className="rounded-2xl bg-white/10 p-4">Supervisor review workflow</div>
              <div className="rounded-2xl bg-white/10 p-4">Admin monitoring dashboard</div>
            </div>
          </div>
          <div className="p-8 md:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Sign in to demo</h2>
              <p className="text-slate-500 mt-2">Choose a role and use the prefilled credentials.</p>
            </div>
            <div className="space-y-4">
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student Demo</option>
                <option value="supervisor">Supervisor Demo</option>
                <option value="admin">Administrator Demo</option>
              </Select>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button className="w-full" onClick={handleLogin} disabled={loading}>
                {loading ? 'Signing in...' : 'Login to Dashboard'}
              </Button>
            </div>
            <div className="mt-6 rounded-2xl bg-slate-50 border p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900 mb-2">Project owner</p>
              <p>Ummulkhulthum Ahmad Tukur</p>
              <p>Reg No: AUS/SCC/COM/22/1042</p>
              <p>Faculty: Science and Computing</p>
              <p>Department: Computer Science</p>
              <p>Institution: Alistiqama University Sumaila, Kano</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function StudentDashboard({ entries, setEntries, notify }) {
  const [form, setForm] = useState({ date: '', title: '', description: '', week: '1' })
  const [loading, setLoading] = useState(false)
  const total = entries.length
  const approved = entries.filter((e) => e.status === 'Approved').length
  const pending = entries.filter((e) => e.status === 'Pending').length

  const submitEntry = () => {
    if (!form.date || !form.title || !form.description) {
      notify('Please complete all log entry fields.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setEntries([
        {
          id: Date.now(),
          date: form.date,
          title: form.title,
          description: form.description,
          week: Number(form.week),
          status: 'Pending',
          feedback: 'Awaiting supervisor review.',
        },
        ...entries,
      ])
      setForm({ date: '', title: '', description: '', week: '1' })
      setLoading(false)
      notify('Log entry submitted successfully.')
    }, 650)
  }

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
              <h3 className="text-xl font-semibold">Submit Log Entry</h3>
              <p className="text-slate-500 mt-1">Capture today’s SIWES activity with enough technical detail.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <Select value={form.week} onChange={(e) => setForm({ ...form, week: e.target.value })}>
                {Array.from({ length: 24 }).map((_, i) => <option key={i + 1} value={String(i + 1)}>Week {i + 1}</option>)}
              </Select>
            </div>
            <Input placeholder="Activity title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Describe what was done, tools used, outcome, and lessons learned" className="min-h-36" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-3 flex-wrap">
              <Button onClick={submitEntry} disabled={loading}>{loading ? 'Submitting...' : 'Submit Entry'}</Button>
              <Button variant="outline" onClick={() => notify('Evidence upload can be connected to backend later.')}>Attach Evidence</Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-semibold">Internship Progress</h3>
              <p className="text-slate-500 mt-1">Track completion and approval rate.</p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span>Overall completion</span><span>68%</span></div>
              <ProgressBar value={68} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span>Supervisor approval rate</span><span>{total ? Math.round((approved / total) * 100) : 0}%</span></div>
              <ProgressBar value={total ? Math.round((approved / total) * 100) : 0} />
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900 mb-2">Latest supervisor note</p>
              <p>Make each entry more outcome-focused. Mention tools, devices, or software used for each task.</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => window.print()}>Download Logbook PDF</Button>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Recent Entries</h3>
            <p className="text-slate-500 mt-1">Review submission status and feedback.</p>
          </div>
          <div className="table-wrap">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                  <th className="py-3 pr-4">Date</th><th className="py-3 pr-4">Title</th><th className="py-3 pr-4">Week</th><th className="py-3 pr-4">Status</th><th className="py-3 pr-4">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-100 align-top">
                    <td className="py-3 pr-4">{entry.date}</td>
                    <td className="py-3 pr-4">{entry.title}</td>
                    <td className="py-3 pr-4">{entry.week}</td>
                    <td className="py-3 pr-4"><Badge tone={entry.status === 'Approved' ? 'default' : entry.status === 'Rejected' ? 'destructive' : 'secondary'}>{entry.status}</Badge></td>
                    <td className="py-3 pr-4 max-w-xs">{entry.feedback || 'No feedback yet'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}

function SupervisorDashboard({ queue, setQueue, notify }) {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [feedbacks, setFeedbacks] = useState({})
  const [loadingId, setLoadingId] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let items = selectedStatus === 'all' ? queue : queue.filter((item) => item.status.toLowerCase() === selectedStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter((item) => item.student.toLowerCase().includes(q) || item.title.toLowerCase().includes(q) || item.id.toLowerCase().includes(q))
    }
    return items
  }, [selectedStatus, queue, search])

  const handleDecision = (id, status) => {
    setLoadingId(id)
    setTimeout(() => {
      setQueue(queue.map((item) => item.id === id ? { ...item, status, feedback: feedbacks[id] || `${status} by supervisor.` } : item))
      setLoadingId(null)
      notify(`Entry ${id} ${status.toLowerCase()}.`)
    }, 700)
  }

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
            <h3 className="text-xl font-semibold">Review Queue</h3>
            <p className="text-slate-500 mt-1">Approve, reject, and comment on submitted entries.</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <Input className="pl-10" placeholder="Search student or activity" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="max-w-44">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
          <div className="table-wrap">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                  <th className="py-3 pr-4">Entry ID</th><th className="py-3 pr-4">Student</th><th className="py-3 pr-4">Date</th><th className="py-3 pr-4">Activity</th><th className="py-3 pr-4">Status</th><th className="py-3 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 align-top">
                    <td className="py-3 pr-4">{item.id}</td>
                    <td className="py-3 pr-4">{item.student}</td>
                    <td className="py-3 pr-4">{item.date}</td>
                    <td className="py-3 pr-4">{item.title}</td>
                    <td className="py-3 pr-4"><Badge tone={item.status === 'Pending' ? 'secondary' : item.status === 'Approved' ? 'default' : 'destructive'}>{item.status}</Badge></td>
                    <td className="py-3 pr-4">
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
              <div key={`${item.id}-feedback`} className="rounded-2xl border p-4">
                <p className="text-sm font-medium mb-2">Feedback for {item.id} — {item.student}</p>
                <Textarea className="min-h-20" placeholder="Write supervisor comment" value={feedbacks[item.id] || item.feedback || ''} onChange={(e) => setFeedbacks({ ...feedbacks, [item.id]: e.target.value })} />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

function AdminDashboard({ students, notify }) {
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
              <h3 className="text-xl font-semibold">Student Monitoring</h3>
              <p className="text-slate-500 mt-1">Overview of active SIWES students and progress.</p>
            </div>
            <div className="table-wrap">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-sm">
                    <th className="py-3 pr-4">ID</th><th className="py-3 pr-4">Name</th><th className="py-3 pr-4">Company</th><th className="py-3 pr-4">Progress</th><th className="py-3 pr-4">Entries</th><th className="py-3 pr-4">Approved</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-4">{student.id}</td>
                      <td className="py-3 pr-4">{student.name}</td>
                      <td className="py-3 pr-4">{student.company}</td>
                      <td className="py-3 pr-4 w-44"><div className="space-y-2"><ProgressBar value={student.progress} /><span className="text-xs text-slate-500">{student.progress}%</span></div></td>
                      <td className="py-3 pr-4">{student.entries}</td>
                      <td className="py-3 pr-4">{student.approved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 grid gap-3">
            <div>
              <h3 className="text-xl font-semibold">Admin Actions</h3>
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
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [entries, setEntries] = useState(defaultEntries)
  const [queue, setQueue] = useState(defaultQueue)
  const [students, setStudents] = useState(defaultStudents)
  const [toast, setToast] = useState('')

  useEffect(() => {
    setUser(readStorage(STORAGE_KEYS.auth, null))
    setEntries(readStorage(STORAGE_KEYS.entries, defaultEntries))
    setQueue(readStorage(STORAGE_KEYS.queue, defaultQueue))
    setStudents(readStorage(STORAGE_KEYS.students, defaultStudents))
  }, [])

  useEffect(() => { writeStorage(STORAGE_KEYS.auth, user) }, [user])
  useEffect(() => { writeStorage(STORAGE_KEYS.entries, entries) }, [entries])
  useEffect(() => { writeStorage(STORAGE_KEYS.queue, queue) }, [queue])
  useEffect(() => { writeStorage(STORAGE_KEYS.students, students) }, [students])

  const notify = (message) => setToast(message)

  const resetDemo = () => {
    localStorage.removeItem(STORAGE_KEYS.entries)
    localStorage.removeItem(STORAGE_KEYS.queue)
    localStorage.removeItem(STORAGE_KEYS.students)
    setEntries(defaultEntries)
    setQueue(defaultQueue)
    setStudents(defaultStudents)
    notify('Demo data has been reset.')
  }

  if (!user) {
    return <><LoginPage onLogin={(profile) => { setUser(profile); notify(`Welcome, ${profile.name}.`) }} /><Toast message={toast} onClose={() => setToast('')} /></>
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
            <p className="text-slate-600 mt-2 max-w-3xl">Interactive role-based demo with login simulation, local persistence, workflow actions, and dashboard navigation.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Card>
              <div className="p-4">
                <p className="text-sm text-slate-500">Project Owner</p>
                <p className="font-semibold mt-1">Ummulkhulthum Ahmad Tukur</p>
                <p className="text-xs text-slate-500 mt-1">Reg No: AUS/SCC/COM/22/1042</p>
                <p className="text-xs text-slate-500">Faculty: Science and Computing</p>
                <p className="text-xs text-slate-500">Department: Computer Science</p>
                <p className="text-xs text-slate-500">Institution: Alistiqama University Sumaila, Kano</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-sm text-slate-500">Signed in as</p>
                <p className="font-semibold mt-1">{user.name}</p>
                <p className="text-xs text-slate-500 mt-1 capitalize">{user.role}</p>
                <p className="text-xs text-slate-500 mt-2">Demo user session</p>
              </div>
            </Card>
            <Button variant="outline" onClick={resetDemo}>Reset Demo Data</Button>
            <Button variant="destructive" onClick={() => setUser(null)}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['student', 'supervisor', 'admin'].map((tab) => (
            <Button key={tab} variant={user.role === tab ? 'default' : 'outline'} className="capitalize" onClick={() => setUser({ ...user, role: tab, name: demoUsers[tab].name, email: demoUsers[tab].email })}>{tab}</Button>
          ))}
        </div>

        {user.role === 'student' && <StudentDashboard entries={entries} setEntries={setEntries} notify={notify} />}
        {user.role === 'supervisor' && <SupervisorDashboard queue={queue} setQueue={setQueue} notify={notify} />}
        {user.role === 'admin' && <AdminDashboard students={students} notify={notify} />}
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
