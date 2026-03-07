'use client'

import { useState, useEffect } from 'react'
import {
  Users, GraduationCap, TrendingUp, DollarSign, AlertCircle,
  Clock, BookOpen, Calendar, ChevronUp, ChevronDown, Activity,
  CheckCircle, XCircle, UserCheck, Briefcase, Bell
} from 'lucide-react'

interface DashboardStats {
  totalStudents: number
  totalStaff: number
  attendance: {
    present: number
    absent: number
    late: number
    rate: number
  }
  finance: {
    collectedToday: number
    transactionsToday: number
    overdueInvoices: number
  }
  upcomingExams: any[]
  pendingLeaveRequests: number
}

function StatCard({ title, value, icon: Icon, trend, color, subtitle }: {
  title: string
  value: string | number
  icon: any
  trend?: number
  color: string
  subtitle?: string
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  )
}

function AttendanceRing({ rate }: { rate: number }) {
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (rate / 100) * circumference
  const color = rate >= 80 ? '#10B981' : rate >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <div className="flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="50" y="54" textAnchor="middle" fill={color} fontSize="18" fontWeight="bold">
          {rate}%
        </text>
      </svg>
    </div>
  )
}

function QuickAction({ label, icon: Icon, color, onClick }: { label: string; icon: any; color: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all group`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <span className="text-xs text-gray-600 text-center font-medium">{label}</span>
    </button>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard/admin', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
        const data = await res.json()
        setStats(data.data?.stats || mockStats)
      } catch {
        setStats(mockStats)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const mockStats: DashboardStats = {
    totalStudents: 1247,
    totalStaff: 89,
    attendance: { present: 1098, absent: 102, late: 47, rate: 88 },
    finance: { collectedToday: 2450000, transactionsToday: 34, overdueInvoices: 87 },
    upcomingExams: [
      { name: 'Mathematics CA', date: '2024-11-15', class: 'JSS 2' },
      { name: 'English Essay', date: '2024-11-16', class: 'SS 1' },
      { name: 'Physics Practical', date: '2024-11-18', class: 'SS 2' },
    ],
    pendingLeaveRequests: 5,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const s = stats!
  const fmt = (n: number) => n >= 1000000 ? `₦${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `₦${(n / 1000).toFixed(0)}K` : `₦${n}`

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl border border-gray-200 p-1">
            {(['today', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${selectedPeriod === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="relative p-2 bg-white rounded-xl border border-gray-200">
            <Bell size={20} className="text-gray-600" />
            {s.pendingLeaveRequests > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={s.totalStudents.toLocaleString()}
          icon={GraduationCap}
          trend={2.4}
          color="bg-blue-500"
          subtitle="Active enrollment"
        />
        <StatCard
          title="Total Staff"
          value={s.totalStaff}
          icon={Briefcase}
          trend={0}
          color="bg-violet-500"
          subtitle="Teaching & non-teaching"
        />
        <StatCard
          title="Collected Today"
          value={fmt(s.finance.collectedToday)}
          icon={DollarSign}
          trend={12}
          color="bg-emerald-500"
          subtitle={`${s.finance.transactionsToday} transactions`}
        />
        <StatCard
          title="Overdue Invoices"
          value={s.finance.overdueInvoices}
          icon={AlertCircle}
          trend={-5}
          color="bg-red-500"
          subtitle="Requiring follow-up"
        />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Attendance Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Today's Attendance</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Live</span>
          </div>
          <div className="flex items-center gap-6">
            <AttendanceRing rate={s.attendance.rate} />
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-600">Present</span>
                </div>
                <span className="font-semibold text-gray-900">{s.attendance.present}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-sm text-gray-600">Absent</span>
                </div>
                <span className="font-semibold text-gray-900">{s.attendance.absent}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-sm text-gray-600">Late</span>
                </div>
                <span className="font-semibold text-gray-900">{s.attendance.late}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Upcoming Exams</h3>
            <a href="/exams" className="text-xs text-blue-600 hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {s.upcomingExams.map((exam, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{exam.name}</p>
                  <p className="text-xs text-gray-500">{exam.class}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(exam.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-2">
            <QuickAction label="Enroll Student" icon={GraduationCap} color="bg-blue-500" />
            <QuickAction label="Take Attendance" icon={UserCheck} color="bg-emerald-500" />
            <QuickAction label="Record Payment" icon={DollarSign} color="bg-violet-500" />
            <QuickAction label="Add Staff" icon={Briefcase} color="bg-amber-500" />
            <QuickAction label="Create Exam" icon={BookOpen} color="bg-rose-500" />
            <QuickAction label="Schedule Event" icon={Calendar} color="bg-cyan-500" />
          </div>
        </div>
      </div>

      {/* Alerts / Notifications */}
      {s.pendingLeaveRequests > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={20} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              {s.pendingLeaveRequests} leave request{s.pendingLeaveRequests > 1 ? 's' : ''} awaiting approval
            </p>
            <p className="text-xs text-amber-700 mt-0.5">Review and approve or decline pending staff leave requests</p>
          </div>
          <a href="/leave" className="text-sm font-medium text-amber-700 hover:text-amber-900 underline flex-shrink-0">
            Review
          </a>
        </div>
      )}

      {s.finance.overdueInvoices > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">
              {s.finance.overdueInvoices} overdue invoices require attention
            </p>
            <p className="text-xs text-red-700 mt-0.5">Send automated reminders or contact parents directly</p>
          </div>
          <a href="/financial/invoices?status=overdue" className="text-sm font-medium text-red-700 hover:text-red-900 underline flex-shrink-0">
            View Defaulters
          </a>
        </div>
      )}
    </div>
  )
}
