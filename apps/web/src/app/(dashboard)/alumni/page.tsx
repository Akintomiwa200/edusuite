'use client'

import { useState } from 'react'
import {
  Users,
  Briefcase,
  Globe2,
  GraduationCap,
  Search,
  Filter,
  Linkedin,
  Mail,
} from 'lucide-react'

interface AlumniRecord {
  id: string
  name: string
  graduationYear: number
  program: string
  currentRole: string
  company: string
  location: string
}

const MOCK_ALUMNI: AlumniRecord[] = [
  {
    id: 'ALU-001',
    name: 'Blessing Chukwu Nwosu',
    graduationYear: 2023,
    program: 'Science',
    currentRole: 'Software Engineer',
    company: 'Lagos Tech Labs',
    location: 'Lagos, Nigeria',
  },
  {
    id: 'ALU-002',
    name: 'Ibrahim Umar Musa',
    graduationYear: 2022,
    program: 'Science',
    currentRole: 'Medical Student',
    company: 'University of Ilorin Teaching Hospital',
    location: 'Ilorin, Nigeria',
  },
  {
    id: 'ALU-003',
    name: 'Chioma Blessing Eze',
    graduationYear: 2021,
    program: 'Arts',
    currentRole: 'Product Designer',
    company: 'Abuja Creative Studio',
    location: 'Abuja, Nigeria',
  },
  {
    id: 'ALU-004',
    name: 'Tunde Adeyemi',
    graduationYear: 2020,
    program: 'Commerce',
    currentRole: 'Business Analyst',
    company: 'Access Bank',
    location: 'Lagos, Nigeria',
  },
]

export default function AlumniPage() {
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState<'all' | 2023 | 2022 | 2021 | 2020>(
    'all'
  )

  const filtered = MOCK_ALUMNI.filter((a) => {
    const matchesYear = yearFilter === 'all' ? true : a.graduationYear === yearFilter
    const matchesSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.currentRole.toLowerCase().includes(search.toLowerCase())
    return matchesYear && matchesSearch
  })

  const totalAlumni = MOCK_ALUMNI.length
  const recentGraduates = MOCK_ALUMNI.filter((a) => a.graduationYear >= 2022).length
  const countriesRepresented = 3

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alumni Network</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track where your graduates are, celebrate their achievements, and build a
            strong alumni community.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <Mail className="w-4 h-4" />
            Email Broadcast
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <GraduationCap className="w-4 h-4" />
            Add Alumni
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Total Registered Alumni
            </p>
            <p className="text-xl font-bold text-gray-900">{totalAlumni}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Graduated in last 2 years
            </p>
            <p className="text-xl font-bold text-gray-900">{recentGraduates}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Globe2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Countries represented
            </p>
            <p className="text-xl font-bold text-gray-900">{countriesRepresented}</p>
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
              placeholder="Search by name, company, or role..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={yearFilter}
              onChange={(e) =>
                setYearFilter(
                  e.target.value === 'all'
                    ? 'all'
                    : (Number(e.target.value) as 2023 | 2022 | 2021 | 2020)
                )
              }
              className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              <option value="2023">Class of 2023</option>
              <option value="2022">Class of 2022</option>
              <option value="2021">Class of 2021</option>
              <option value="2020">Class of 2020</option>
            </select>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              <Filter className="w-3.5 h-3.5" />
              Advanced filters
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Alumni
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Programme
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Current role
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Organisation
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Location
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                      {a.name
                        .split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{a.name}</p>
                      <p className="text-xs text-gray-500">
                        Class of {a.graduationYear}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{a.program}</td>
                <td className="px-4 py-3 text-gray-700">{a.currentRole}</td>
                <td className="px-4 py-3 text-gray-700">{a.company}</td>
                <td className="px-4 py-3 text-gray-700">{a.location}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800">
                      <Linkedin className="w-3.5 h-3.5" />
                      View profile
                    </button>
                    <button className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900">
                      <Mail className="w-3.5 h-3.5" />
                      Contact
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No alumni match your filters yet.
            </p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Showing {filtered.length} of {MOCK_ALUMNI.length} alumni
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
