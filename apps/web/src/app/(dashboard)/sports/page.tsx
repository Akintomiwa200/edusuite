'use client'

import { useState } from 'react'
import {
  Trophy,
  Users,
  Calendar,
  Dumbbell,
  Search,
  Filter,
} from 'lucide-react'

interface TeamRecord {
  id: string
  name: string
  sport: string
  coach: string
  players: number
  upcomingFixture?: string
}

const MOCK_TEAMS: TeamRecord[] = [
  {
    id: 'SP-FTB-01',
    name: 'Senior Boys Football',
    sport: 'Football',
    coach: 'Coach Musa',
    players: 22,
    upcomingFixture: 'Vs Queens College – 15 Nov',
  },
  {
    id: 'SP-BBK-02',
    name: 'Junior Girls Basketball',
    sport: 'Basketball',
    coach: 'Coach Ade',
    players: 14,
    upcomingFixture: 'Inter-house Trials – 20 Nov',
  },
  {
    id: 'SP-ATH-03',
    name: 'Track & Field Squad',
    sport: 'Athletics',
    coach: 'Coach Chukwu',
    players: 18,
    upcomingFixture: 'Lagos State Meet – 1 Dec',
  },
]

export default function SportsPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_TEAMS.filter((t) => {
    const q = search.toLowerCase()
    return (
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.sport.toLowerCase().includes(q) ||
      t.coach.toLowerCase().includes(q)
    )
  })

  const totalTeams = MOCK_TEAMS.length
  const totalAthletes = MOCK_TEAMS.reduce((a, t) => a + t.players, 0)
  const fixtures = MOCK_TEAMS.filter((t) => t.upcomingFixture).length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sports & Co‑curricular</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage school teams, fixtures, and student participation in sports activities.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            View Fixtures
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <Trophy className="w-4 h-4" />
            Add Team
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Active Teams
            </p>
            <p className="text-xl font-bold text-gray-900">{totalTeams}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Registered Athletes
            </p>
            <p className="text-xl font-bold text-gray-900">{totalAthletes}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Upcoming Fixtures
            </p>
            <p className="text-xl font-bold text-gray-900">{fixtures}</p>
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
              placeholder="Search by team, sport, or coach..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Filter className="w-3.5 h-3.5" />
            Filter by sport
          </button>
        </div>
      </div>

      {/* Teams list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Team
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Sport
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Coach
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Players
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Next fixture
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
                    <span className="font-medium text-gray-900">{t.name}</span>
                    <span className="text-xs text-gray-500">{t.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{t.sport}</td>
                <td className="px-4 py-3 text-gray-700">{t.coach}</td>
                <td className="px-4 py-3 text-gray-700">{t.players}</td>
                <td className="px-4 py-3 text-gray-700">
                  {t.upcomingFixture || '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
                    View squad
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No teams match your search.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
