'use client'

import { useState } from 'react'
import {
  Users,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  ArrowDownUp,
} from 'lucide-react'

type PayrollStatus = 'paid' | 'pending' | 'overdue'

interface PayrollRecord {
  id: string
  staffName: string
  role: string
  department: string
  month: string
  gross: number
  deductions: number
  net: number
  status: PayrollStatus
}

const MOCK_PAYROLL: PayrollRecord[] = [
  {
    id: 'PR-2024-11-001',
    staffName: 'Adewale Babatunde',
    role: 'Senior Mathematics Teacher',
    department: 'Academics',
    month: 'Nov 2024',
    gross: 450000,
    deductions: 52000,
    net: 398000,
    status: 'paid',
  },
  {
    id: 'PR-2024-11-002',
    staffName: 'Chioma Blessing',
    role: 'School Accountant',
    department: 'Finance',
    month: 'Nov 2024',
    gross: 520000,
    deductions: 67000,
    net: 453000,
    status: 'pending',
  },
  {
    id: 'PR-2024-11-003',
    staffName: 'Ibrahim Musa',
    role: 'Bus Driver',
    department: 'Transport',
    month: 'Nov 2024',
    gross: 210000,
    deductions: 24000,
    net: 186000,
    status: 'overdue',
  },
  {
    id: 'PR-2024-11-004',
    staffName: 'Fatima Aisha',
    role: 'School Nurse',
    department: 'Health',
    month: 'Nov 2024',
    gross: 320000,
    deductions: 41000,
    net: 279000,
    status: 'paid',
  },
]

const STATUS_STYLE: Record<
  PayrollStatus,
  { label: string; bg: string; text: string }
> = {
  paid: {
    label: 'Paid',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
  overdue: {
    label: 'Overdue',
    bg: 'bg-red-50',
    text: 'text-red-700',
  },
}

const formatCurrency = (amount: number) =>
  `₦${amount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`

export default function PayrollDashboardPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | PayrollStatus>('all')
  const [search, setSearch] = useState('')
  const [monthFilter, setMonthFilter] = useState('Nov 2024')
  const [sortField, setSortField] = useState<'name' | 'net'>('name')

  const filtered = MOCK_PAYROLL.filter((p) => {
    const matchesStatus =
      statusFilter === 'all' ? true : p.status === statusFilter
    const matchesMonth = !monthFilter || p.month === monthFilter
    const matchesSearch =
      !search ||
      p.staffName.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesMonth && matchesSearch
  }).sort((a, b) => {
    if (sortField === 'name') {
      return a.staffName.localeCompare(b.staffName)
    }
    return b.net - a.net
  })

  const totals = MOCK_PAYROLL.reduce(
    (acc, p) => {
      acc.gross += p.gross
      acc.net += p.net
      if (p.status === 'paid') acc.paid += 1
      if (p.status === 'pending') acc.pending += 1
      if (p.status === 'overdue') acc.overdue += 1
      return acc
    },
    { gross: 0, net: 0, paid: 0, pending: 0, overdue: 0 }
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage staff salaries, deductions, and payment status for each
            pay cycle.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            Export Payslips
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <DollarSign className="w-4 h-4" />
            Run Payroll
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase">
              Total Gross
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(totals.gross)}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Across {MOCK_PAYROLL.length} staff this month
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase">
              Net Payout
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(totals.net)}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            After taxes and statutory deductions
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase">
              Pending Payments
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {totals.pending} staff
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Require finance approval
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase">
              Overdue
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {totals.overdue} staff
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Exceeded agreed payment date
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by staff name, department, or payroll ID..."
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              <Filter className="w-3.5 h-3.5" />
              More filters
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Nov 2024</option>
              <option>Oct 2024</option>
              <option>Sep 2024</option>
            </select>

            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              {(['all', 'paid', 'pending', 'overdue'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    setStatusFilter(status === 'all' ? 'all' : status)
                  }
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium capitalize ${
                    statusFilter === status
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                setSortField((prev) => (prev === 'name' ? 'net' : 'name'))
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              Sort by {sortField === 'name' ? 'Name' : 'Net Pay'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Staff
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Department
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Month
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Gross
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Net
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const s = STATUS_STYLE[p.status]
              return (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {p.staffName}
                      </span>
                      <span className="text-xs text-gray-500">{p.role}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{p.department}</td>
                  <td className="px-4 py-3 text-gray-700">{p.month}</td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatCurrency(p.gross)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {formatCurrency(p.net)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
                    >
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
                      View slip
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No payroll records match your filters.
            </p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Showing {filtered.length} of {MOCK_PAYROLL.length} records
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
