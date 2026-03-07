'use client'

import { useState } from 'react'
import {
  CalendarDays,
  MapPin,
  Users,
  Search,
  Filter,
} from 'lucide-react'

interface SchoolEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  audience: string
}

const MOCK_EVENTS: SchoolEvent[] = [
  {
    id: 'EV-001',
    title: 'PTA General Meeting',
    date: '2024-11-16',
    time: '10:00 AM',
    location: 'School Hall',
    audience: 'All parents',
  },
  {
    id: 'EV-002',
    title: 'Inter‑House Sports Day',
    date: '2024-11-30',
    time: '9:00 AM',
    location: 'Sports Field',
    audience: 'All students & parents',
  },
  {
    id: 'EV-003',
    title: 'Career Day Fair',
    date: '2024-12-05',
    time: '11:00 AM',
    location: 'Auditorium',
    audience: 'SS 1–3 students',
  },
]

export default function EventsPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_EVENTS.filter((e) => {
    const q = search.toLowerCase()
    return (
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.audience.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-1">
            Plan and track academic, cultural, and co‑curricular events in your school
            calendar.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <CalendarDays className="w-4 h-4" />
            Export Calendar
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <CalendarDays className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Upcoming Events
            </p>
            <p className="text-xl font-bold text-gray-900">{MOCK_EVENTS.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Typical Attendance
            </p>
            <p className="text-xl font-bold text-gray-900">500+</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Key Venues
            </p>
            <p className="text-sm font-semibold text-gray-900">
              Hall, Auditorium, Sports Field
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
              placeholder="Search events by title, venue, or audience..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Filter className="w-3.5 h-3.5" />
            Filter by term
          </button>
        </div>
      </div>

      {/* Events list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Event
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Date & Time
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Location
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Audience
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr
                key={e.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{e.title}</span>
                    <span className="text-xs text-gray-500">{e.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {new Date(e.date).toLocaleDateString('en-GB')} &bull; {e.time}
                </td>
                <td className="px-4 py-3 text-gray-700">{e.location}</td>
                <td className="px-4 py-3 text-gray-700">{e.audience}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
                    View details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No upcoming events match your search.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
