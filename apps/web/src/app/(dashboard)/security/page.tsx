'use client'

import { useState } from 'react'
import {
  Shield,
  AlertTriangle,
  Users,
  Search,
  Filter,
} from 'lucide-react'

interface SecurityIncident {
  id: string
  type: string
  location: string
  reportedBy: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'resolved'
}

const MOCK_INCIDENTS: SecurityIncident[] = [
  {
    id: 'SEC-001',
    type: 'Visitor without ID',
    location: 'Main Gate',
    reportedBy: 'Gate Security',
    severity: 'low',
    status: 'resolved',
  },
  {
    id: 'SEC-002',
    type: 'Student altercation',
    location: 'Junior Block',
    reportedBy: 'Teacher on Duty',
    severity: 'medium',
    status: 'open',
  },
  {
    id: 'SEC-003',
    type: 'Suspicious vehicle',
    location: 'Car Park',
    reportedBy: 'CCTV Room',
    severity: 'high',
    status: 'open',
  },
]

export default function SecurityPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_INCIDENTS.filter((i) => {
    const q = search.toLowerCase()
    return (
      !q ||
      i.type.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q)
    )
  })

  const open = MOCK_INCIDENTS.filter((i) => i.status === 'open').length
  const high = MOCK_INCIDENTS.filter((i) => i.severity === 'high').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security</h1>
          <p className="text-sm text-gray-500 mt-1">
            Log security incidents, monitor critical alerts, and coordinate response.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <Users className="w-4 h-4" />
            Guard Roster
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <AlertTriangle className="w-4 h-4" />
            New Incident
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Open Incidents
            </p>
            <p className="text-xl font-bold text-gray-900">{open}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              High Severity
            </p>
            <p className="text-xl font-bold text-gray-900">{high}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Security Team
            </p>
            <p className="text-sm font-semibold text-gray-900">
              8 guards on duty
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
              placeholder="Search incidents by type, location, or ID..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Filter className="w-3.5 h-3.5" />
            Filter by severity
          </button>
        </div>
      </div>

      {/* Incident list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Incident
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Location
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Reported By
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Severity
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr
                key={i.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{i.type}</span>
                    <span className="text-xs text-gray-500">{i.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{i.location}</td>
                <td className="px-4 py-3 text-gray-700">{i.reportedBy}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      i.severity === 'high'
                        ? 'bg-red-50 text-red-700'
                        : i.severity === 'medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {i.severity.charAt(0).toUpperCase() + i.severity.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      i.status === 'open'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {i.status.charAt(0).toUpperCase() + i.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No incidents match your filters at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
