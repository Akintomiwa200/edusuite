'use client'

import { useState } from 'react'
import {
  Mail,
  MessageCircle,
  Bell,
  Users,
  Search,
  Filter,
} from 'lucide-react'

interface CommunicationItem {
  id: string
  channel: 'email' | 'sms' | 'in-app'
  subject: string
  audience: string
  sentAt: string
  status: 'scheduled' | 'sent' | 'failed'
}

const MOCK_COMMS: CommunicationItem[] = [
  {
    id: 'COM-001',
    channel: 'email',
    subject: 'Mid-term Exam Timetable',
    audience: 'Parents of JSS 1–3',
    sentAt: '2024-11-04 08:30',
    status: 'sent',
  },
  {
    id: 'COM-002',
    channel: 'sms',
    subject: 'Fee Reminder – November',
    audience: 'Parents with outstanding fees',
    sentAt: '2024-11-03 10:00',
    status: 'sent',
  },
  {
    id: 'COM-003',
    channel: 'in-app',
    subject: 'PTA Meeting Notice',
    audience: 'All parents',
    sentAt: '2024-11-05 07:15',
    status: 'scheduled',
  },
]

export default function CommunicationPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_COMMS.filter((c) => {
    const q = search.toLowerCase()
    return (
      !q ||
      c.subject.toLowerCase().includes(q) ||
      c.audience.toLowerCase().includes(q) ||
      c.channel.toLowerCase().includes(q)
    )
  })

  const totalSent = MOCK_COMMS.filter((c) => c.status === 'sent').length
  const scheduled = MOCK_COMMS.filter((c) => c.status === 'scheduled').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication</h1>
          <p className="text-sm text-gray-500 mt-1">
            Coordinate announcements across email, SMS, and in‑app notifications.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <Users className="w-4 h-4" />
            Manage Audiences
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <Mail className="w-4 h-4" />
            New Broadcast
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Email / SMS Sent
            </p>
            <p className="text-xl font-bold text-gray-900">{totalSent}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Scheduled Notices
            </p>
            <p className="text-xl font-bold text-gray-900">{scheduled}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Primary Channel
            </p>
            <p className="text-sm font-semibold text-gray-900">
              Email & In‑App
            </p>
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
              placeholder="Search communications by subject, audience, or channel..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Filter className="w-3.5 h-3.5" />
            Filter by status
          </button>
        </div>
      </div>

      {/* Communications list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Subject
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Channel
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Audience
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Sent at
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const channelBadge =
                c.channel === 'email'
                  ? 'bg-blue-50 text-blue-700'
                  : c.channel === 'sms'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-purple-50 text-purple-700'

              const statusBadge =
                c.status === 'sent'
                  ? 'bg-emerald-50 text-emerald-700'
                  : c.status === 'scheduled'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'

              return (
                <tr
                  key={c.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {c.subject}
                      </span>
                      <span className="text-xs text-gray-500">{c.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${channelBadge}`}
                    >
                      {c.channel === 'in-app'
                        ? 'In‑App'
                        : c.channel.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.audience}</td>
                  <td className="px-4 py-3 text-gray-700">{c.sentAt}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge}`}
                    >
                      {c.status === 'sent'
                        ? 'Sent'
                        : c.status === 'scheduled'
                        ? 'Scheduled'
                        : 'Failed'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No communications match your search yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
