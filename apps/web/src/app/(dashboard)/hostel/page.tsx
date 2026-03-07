'use client'

import { useState } from 'react'
import {
  BedDouble,
  Users,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react'

interface HostelRoom {
  id: string
  hostel: string
  roomNumber: string
  capacity: number
  occupied: number
  gender: 'Male' | 'Female'
}

const MOCK_ROOMS: HostelRoom[] = [
  {
    id: 'HS-01',
    hostel: 'Queen Amina Hostel',
    roomNumber: 'G-12',
    capacity: 4,
    occupied: 4,
    gender: 'Female',
  },
  {
    id: 'HS-02',
    hostel: 'Queen Amina Hostel',
    roomNumber: 'F-03',
    capacity: 4,
    occupied: 3,
    gender: 'Female',
  },
  {
    id: 'HS-03',
    hostel: 'Unity Boys Hostel',
    roomNumber: 'B-09',
    capacity: 6,
    occupied: 5,
    gender: 'Male',
  },
]

export default function HostelPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_ROOMS.filter((r) => {
    const q = search.toLowerCase()
    return (
      !q ||
      r.hostel.toLowerCase().includes(q) ||
      r.roomNumber.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    )
  })

  const totalBeds = MOCK_ROOMS.reduce((a, r) => a + r.capacity, 0)
  const occupiedBeds = MOCK_ROOMS.reduce((a, r) => a + r.occupied, 0)
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hostel Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor hostel capacity, room allocations, and gender separation.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <Users className="w-4 h-4" />
            Assign Students
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <BedDouble className="w-4 h-4" />
            Add Room
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <BedDouble className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Total Beds
            </p>
            <p className="text-xl font-bold text-gray-900">{totalBeds}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Occupied Beds
            </p>
            <p className="text-xl font-bold text-gray-900">{occupiedBeds}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Occupancy Rate
            </p>
            <p className="text-xl font-bold text-gray-900">{occupancyRate}%</p>
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
              placeholder="Search by hostel name, room, or ID..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Filter className="w-3.5 h-3.5" />
            Filter by gender
          </button>
        </div>
      </div>

      {/* Rooms table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Hostel / Room
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Gender
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Occupancy
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const ratio = r.occupied / r.capacity
              const color =
                ratio >= 1
                  ? 'text-red-600'
                  : ratio >= 0.8
                  ? 'text-amber-600'
                  : 'text-emerald-600'

              return (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {r.hostel}
                      </span>
                      <span className="text-xs text-gray-500">
                        Room {r.roomNumber} • {r.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.gender}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${color}`}>
                      {r.occupied}/{r.capacity}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">students</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
                      View occupants
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

      </div>
    </div>
  )
}
