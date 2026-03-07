'use client'

import { useState } from 'react'
import {
  Bus,
  MapPin,
  Users,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react'

interface RouteRecord {
  id: string
  name: string
  busCode: string
  driver: string
  capacity: number
  enrolled: number
  status: 'on-time' | 'delayed' | 'offline'
}

const MOCK_ROUTES: RouteRecord[] = [
  {
    id: 'RT-01',
    name: 'Lekki – Ajah – School',
    busCode: 'BUS-12',
    driver: 'Mr. Adewale',
    capacity: 48,
    enrolled: 44,
    status: 'on-time',
  },
  {
    id: 'RT-02',
    name: 'Yaba – Sabo – School',
    busCode: 'BUS-05',
    driver: 'Mr. Musa',
    capacity: 40,
    enrolled: 39,
    status: 'delayed',
  },
  {
    id: 'RT-03',
    name: 'Ikorodu – Ojota – School',
    busCode: 'BUS-21',
    driver: 'Mr. Chukwu',
    capacity: 52,
    enrolled: 50,
    status: 'on-time',
  },
  {
    id: 'RT-04',
    name: 'Satellite Town – School',
    busCode: 'BUS-03',
    driver: 'Mr. Johnson',
    capacity: 32,
    enrolled: 0,
    status: 'offline',
  },
]

export default function TransportPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'on-time' | 'delayed' | 'offline'>(
    'all'
  )

  const filtered = MOCK_ROUTES.filter((r) => {
    const matchesStatus =
      statusFilter === 'all' ? true : r.status === statusFilter
    const matchesSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.driver.toLowerCase().includes(search.toLowerCase()) ||
      r.busCode.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalBuses = MOCK_ROUTES.length
  const totalStudents = MOCK_ROUTES.reduce((a, r) => a + r.enrolled, 0)
  const delayedRoutes = MOCK_ROUTES.filter((r) => r.status === 'delayed').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transport</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor school bus routes, capacity, and student assignments in real time.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <MapPin className="w-4 h-4" />
            View Live Map
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <Bus className="w-4 h-4" />
            Add Route
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Bus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Active Buses
            </p>
            <p className="text-xl font-bold text-gray-900">{totalBuses}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Students on Transport
            </p>
            <p className="text-xl font-bold text-gray-900">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Delayed Routes
            </p>
            <p className="text-xl font-bold text-gray-900">{delayedRoutes}</p>
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
              placeholder="Search by route, bus code, or driver..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              {(['all', 'on-time', 'delayed', 'offline'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium capitalize ${
                    statusFilter === status
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('-', ' ')}
                </button>
              ))}
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              <Filter className="w-3.5 h-3.5" />
              More filters
            </button>
          </div>
        </div>
      </div>

      {/* Routes table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Route
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Bus / Driver
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Capacity
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const capacityColor =
                r.enrolled / r.capacity >= 0.9
                  ? 'text-red-600'
                  : r.enrolled / r.capacity >= 0.7
                  ? 'text-amber-600'
                  : 'text-emerald-600'

              const statusBadge =
                r.status === 'on-time'
                  ? 'bg-emerald-50 text-emerald-700'
                  : r.status === 'delayed'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-gray-100 text-gray-600'

              return (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{r.name}</span>
                      <span className="text-xs text-gray-500">{r.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 font-medium">{r.busCode}</p>
                    <p className="text-xs text-gray-500">{r.driver}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${capacityColor}`}>
                      {r.enrolled}/{r.capacity}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">students</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge}`}
                    >
                      {r.status === 'on-time'
                        ? 'On time'
                        : r.status === 'delayed'
                        ? 'Delayed'
                        : 'Offline'}
                    </span>
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
            <Bus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No routes match your filters at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
