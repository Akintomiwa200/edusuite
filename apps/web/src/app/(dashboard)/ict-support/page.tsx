'use client'

import { useState } from 'react'
import {
  MonitorSmartphone,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
} from 'lucide-react'

type TicketStatus = 'open' | 'in-progress' | 'resolved'

interface SupportTicket {
  id: string
  subject: string
  requester: string
  category: string
  priority: 'low' | 'medium' | 'high'
  status: TicketStatus
}

const MOCK_SUPPORT: SupportTicket[] = [
  {
    id: 'IT-001',
    subject: 'Projector not working in SS3B',
    requester: 'Mrs. Okafor',
    category: 'Classroom Hardware',
    priority: 'high',
    status: 'open',
  },
  {
    id: 'IT-002',
    subject: 'Student portal login issue',
    requester: 'Student Helpdesk',
    category: 'Accounts & Access',
    priority: 'medium',
    status: 'in-progress',
  },
  {
    id: 'IT-003',
    subject: 'Wi‑Fi outage in admin block',
    requester: 'Front Desk',
    category: 'Network',
    priority: 'high',
    status: 'resolved',
  },
]

export default function IctSupportPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all')

  const filtered = MOCK_SUPPORT.filter((t) => {
    const matchesStatus =
      statusFilter === 'all' ? true : t.status === statusFilter
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      t.subject.toLowerCase().includes(q) ||
      t.requester.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  const open = MOCK_SUPPORT.filter((t) => t.status === 'open').length
  const inProgress = MOCK_SUPPORT.filter((t) => t.status === 'in-progress').length
  const resolvedToday = 1

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ICT Support</h1>
          <p className="text-sm text-gray-500 mt-1">
            Central helpdesk for devices, network, accounts, and classroom technology.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <MonitorSmartphone className="w-4 h-4" />
            Asset Inventory
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <AlertTriangle className="w-4 h-4" />
            New Ticket
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
            <p className="text-xl font-bold text-gray-900">{open}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <MonitorSmartphone className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              In Progress
            </p>
            <p className="text-xl font-bold text-gray-900">{inProgress}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Resolved Today
            </p>
            <p className="text-xl font-bold text-gray-900">{resolvedToday}</p>
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
              placeholder="Search by ticket, requester, or category..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              {(['all', 'open', 'in-progress', 'resolved'] as const).map(
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
              Filter by priority
            </button>
          </div>
        </div>
      </div>

      {/* Tickets */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Ticket
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Requester
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Category
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Priority
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr
                key={t.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{t.subject}</span>
                    <span className="text-xs text-gray-500">{t.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{t.requester}</td>
                <td className="px-4 py-3 text-gray-700">{t.category}</td>
                <td className="px-4 py-3 text-gray-700 capitalize">
                  {t.priority}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      t.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : t.status === 'in-progress'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {t.status === 'in-progress' ? 'In Progress' : t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <MonitorSmartphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No ICT support tickets match your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
