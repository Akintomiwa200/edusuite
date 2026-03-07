'use client'

import { useState } from 'react'
import {
  Stethoscope,
  AlertTriangle,
  Users,
  Search,
  Filter,
} from 'lucide-react'

interface ClinicVisit {
  id: string
  student: string
  className: string
  reason: string
  severity: 'minor' | 'moderate' | 'critical'
  time: string
}

const MOCK_VISITS: ClinicVisit[] = [
  {
    id: 'HC-001',
    student: 'Adewale Babatunde',
    className: 'SS 2A',
    reason: 'Headache & dizziness',
    severity: 'moderate',
    time: '08:45',
  },
  {
    id: 'HC-002',
    student: 'Chioma Eze',
    className: 'SS 3B',
    reason: 'Sports injury – ankle sprain',
    severity: 'critical',
    time: '10:15',
  },
  {
    id: 'HC-003',
    student: 'Ibrahim Musa',
    className: 'JSS 3C',
    reason: 'Stomach ache',
    severity: 'minor',
    time: '11:05',
  },
]

export default function HealthPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_VISITS.filter((v) => {
    const q = search.toLowerCase()
    return (
      !q ||
      v.student.toLowerCase().includes(q) ||
      v.className.toLowerCase().includes(q) ||
      v.reason.toLowerCase().includes(q)
    )
  })

  const totalVisits = MOCK_VISITS.length
  const criticalCases = MOCK_VISITS.filter((v) => v.severity === 'critical').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health & Clinic</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track clinic visits, medication, and emergency cases for students.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <Users className="w-4 h-4" />
            Medical Profiles
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <Stethoscope className="w-4 h-4" />
            New Visit
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Clinic Visits Today
            </p>
            <p className="text-xl font-bold text-gray-900">{totalVisits}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Critical Cases
            </p>
            <p className="text-xl font-bold text-gray-900">{criticalCases}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Nurse on Duty
            </p>
            <p className="text-sm font-semibold text-gray-900">
              Nurse Ade – Morning shift
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
              placeholder="Search by student, class, or reason..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Filter className="w-3.5 h-3.5" />
            Filter by severity
          </button>
        </div>
      </div>

      {/* Visits table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Student
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Class
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Reason
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Severity
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr
                key={v.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {v.student}
                    </span>
                    <span className="text-xs text-gray-500">{v.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{v.className}</td>
                <td className="px-4 py-3 text-gray-700">{v.reason}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      v.severity === 'critical'
                        ? 'bg-red-50 text-red-700'
                        : v.severity === 'moderate'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {v.severity.charAt(0).toUpperCase() + v.severity.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{v.time}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Stethoscope className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No clinic visits recorded for this selection yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
