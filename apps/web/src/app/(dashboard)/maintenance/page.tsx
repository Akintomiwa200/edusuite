'use client'

import { useState } from 'react'
import {
  Wrench,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
} from 'lucide-react'

type TicketStatus = 'open' | 'in-progress' | 'completed'

interface MaintenanceTicket {
  id: string
  title: string
  location: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: TicketStatus
  createdAt: string
}

const MOCK_TICKETS: MaintenanceTicket[] = [
  {
    id: 'MT-2024-1101',
    title: 'Electrical fault in Physics Lab',
    location: 'Senior Block – Physics Lab',
    category: 'ELECTRICAL',
    priority: 'critical',
    status: 'open',
    createdAt: '2024-11-05',
  },
  {
    id: 'MT-2024-1102',
    title: 'Leaking tap in Girls Hostel',
    location: 'Girls Hostel – 2nd Floor',
    category: 'PLUMBING',
    priority: 'medium',
    status: 'in-progress',
    createdAt: '2024-11-04',
  },
  {
    id: 'MT-2024-1103',
    title: 'Broken classroom door',
    location: 'Junior Block – JSS 2B',
    category: 'CARPENTRY',
    priority: 'high',
    status: 'open',
    createdAt: '2024-11-03',
  },
  {
    id: 'MT-2024-1104',
    title: 'AC not cooling',
    location: 'ICT Centre',
    category: 'HVAC',
    priority: 'low',
    status: 'completed',
    createdAt: '2024-11-01',
  },
]

const PRIORITY_BADGE: Record<
  MaintenanceTicket['priority'],
  { label: string; bg: string; text: string }
> = {
  low: { label: 'Low', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  medium: { label: 'Medium', bg: 'bg-blue-50', text: 'text-blue-700' },
  high: { label: 'High', bg: 'bg-amber-50', text: 'text-amber-700' },
  critical: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700' },
}

const STATUS_BADGE: Record<
  TicketStatus,
  { label: string; bg: string; text: string }
> = {
  open: { label: 'Open', bg: 'bg-amber-50', text: 'text-amber-700' },
  'in-progress': {
    label: 'In Progress',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
}

export default function MaintenanceDashboardPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all')

  const filtered = MOCK_TICKETS.filter((t) => {
    const matchesStatus =
      statusFilter === 'all' ? true : t.status === statusFilter
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const openCount = MOCK_TICKETS.filter((t) => t.status === 'open').length
  const inProgressCount = MOCK_TICKETS.filter(
    (t) => t.status === 'in-progress'
  ).length
  const completedToday = 1

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track campus issues, prioritize safety-related work, and monitor SLA
            performance for your maintenance team.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <Building2 className="w-4 h-4" />
            View Asset Register
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <Wrench className="w-4 h-4" />
            Log Ticket
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Open Tickets
            </p>
            <p className="text-xl font-bold text-gray-900">{openCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              In Progress
            </p>
            <p className="text-xl font-bold text-gray-900">{inProgressCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Completed Today
            </p>
            <p className="text-xl font-bold text-gray-900">{completedToday}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket ID, title, or location..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              {(['all', 'open', 'in-progress', 'completed'] as const).map(
                (status) => (
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
                    {status.replace('-', ' ')}
                  </button>
                )
              )}
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              <Filter className="w-3.5 h-3.5" />
              SLA filters
            </button>
          </div>
        </div>
      </div>

      {/* Tickets table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Ticket
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Location
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Category
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Priority
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Opened
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const pri = PRIORITY_BADGE[t.priority]
              const stat = STATUS_BADGE[t.status]
              return (
                <tr
                  key={t.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {t.title}
                      </span>
                      <span className="text-xs text-gray-500">{t.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{t.location}</td>
                  <td className="px-4 py-3 text-gray-700">{t.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${pri.bg} ${pri.text}`}
                    >
                      {pri.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stat.bg} ${stat.text}`}
                    >
                      {stat.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(t.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
                      View details
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No tickets match your filters right now.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
