'use client'

import { useState } from 'react'
import {
  Users, Search, Plus, Filter, Star, Book, Award, UserCheck,
  TrendingUp, Clock, ChevronRight, MoreHorizontal, Mail, Phone,
  GraduationCap, Briefcase, CheckCircle, AlertCircle, XCircle,
  Download, Upload, Eye, Edit, BarChart2, Badge
} from 'lucide-react'

type Status = 'active' | 'on_leave' | 'suspended' | 'resigned'
type Tab = 'all' | 'active' | 'on_leave' | 'suspended'
type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'visiting'

interface Teacher {
  id: string
  staffId: string
  name: string
  email: string
  phone: string
  gender: string
  subjects: string[]
  classes: string[]
  formClass?: string
  employmentType: EmploymentType
  qualifications: string
  status: Status
  dateOfEmployment: string
  averageRating: number
  cpdPoints: number
  profileInitials: string
  color: string
}

const MOCK_TEACHERS: Teacher[] = [
  {
    id: '1', staffId: 'TCH/24/0001', name: 'Mrs. Fatima Okafor', email: 'f.okafor@school.edu',
    phone: '+234 810 234 5678', gender: 'female', subjects: ['Chemistry', 'Biology'],
    classes: ['SS 1A', 'SS 1B', 'SS 2A'], formClass: 'SS 2A', employmentType: 'full_time',
    qualifications: 'B.Sc Chemistry, PGDE', status: 'active', dateOfEmployment: '2018-09-01',
    averageRating: 4.7, cpdPoints: 85, profileInitials: 'FO', color: 'bg-emerald-500',
  },
  {
    id: '2', staffId: 'TCH/24/0002', name: 'Mr. Emeka Nwosu', email: 'e.nwosu@school.edu',
    phone: '+234 802 345 6789', gender: 'male', subjects: ['Mathematics', 'Further Mathematics'],
    classes: ['SS 2B', 'SS 3A', 'SS 3B'], formClass: undefined, employmentType: 'full_time',
    qualifications: 'B.Sc Mathematics', status: 'active', dateOfEmployment: '2019-01-15',
    averageRating: 4.9, cpdPoints: 110, profileInitials: 'EN', color: 'bg-blue-500',
  },
  {
    id: '3', staffId: 'TCH/24/0003', name: 'Miss Adunola Adeyemi', email: 'a.adeyemi@school.edu',
    phone: '+234 808 456 7890', gender: 'female', subjects: ['English Language', 'Literature'],
    classes: ['JSS 1A', 'JSS 1B', 'JSS 2A'], formClass: 'JSS 1A', employmentType: 'full_time',
    qualifications: 'B.Ed English, M.Ed', status: 'on_leave', dateOfEmployment: '2020-04-10',
    averageRating: 4.5, cpdPoints: 60, profileInitials: 'AA', color: 'bg-purple-500',
  },
  {
    id: '4', staffId: 'TCH/24/0004', name: 'Mr. Yusuf Ibrahim', email: 'y.ibrahim@school.edu',
    phone: '+234 803 567 8901', gender: 'male', subjects: ['Physics'],
    classes: ['SS 1A', 'SS 2A', 'SS 3A'], formClass: undefined, employmentType: 'part_time',
    qualifications: 'B.Sc Physics', status: 'active', dateOfEmployment: '2021-09-01',
    averageRating: 4.3, cpdPoints: 40, profileInitials: 'YI', color: 'bg-orange-500',
  },
  {
    id: '5', staffId: 'TCH/24/0005', name: 'Mrs. Grace Okonkwo', email: 'g.okonkwo@school.edu',
    phone: '+234 806 678 9012', gender: 'female', subjects: ['Economics', 'Commerce'],
    classes: ['SS 1A', 'SS 2B', 'SS 3A'], formClass: 'SS 3A', employmentType: 'full_time',
    qualifications: 'B.Sc Economics, PGDE', status: 'active', dateOfEmployment: '2017-04-15',
    averageRating: 4.6, cpdPoints: 95, profileInitials: 'GO', color: 'bg-teal-500',
  },
]

const STATUS_CONFIG: Record<Status, { label: string; icon: typeof CheckCircle; color: string; bg: string }> = {
  active: { label: 'Active', icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-100' },
  on_leave: { label: 'On Leave', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-100' },
  suspended: { label: 'Suspended', icon: AlertCircle, color: 'text-red-700', bg: 'bg-red-100' },
  resigned: { label: 'Resigned', icon: XCircle, color: 'text-gray-700', bg: 'bg-gray-100' },
}

const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  visiting: 'Visiting',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(star => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
      <span className="text-xs text-gray-600 ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function TeachersPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [teachers] = useState<Teacher[]>(MOCK_TEACHERS)
  const [search, setSearch] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = teachers.filter(t => {
    const matchesTab = activeTab === 'all' || t.status === activeTab
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.staffId.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.some(s => s.toLowerCase().includes(search.toLowerCase()))
    return matchesTab && matchesSearch
  })

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'active').length,
    onLeave: teachers.filter(t => t.status === 'on_leave').length,
    avgRating: (teachers.reduce((a, t) => a + t.averageRating, 0) / teachers.length).toFixed(1),
    formTeachers: teachers.filter(t => t.formClass).length,
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage staff records, assignments, and performance</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Staff', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'On Leave', value: stats.onLeave, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Avg Rating', value: stats.avgRating, icon: Star, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Form Teachers', value: stats.formTeachers, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, staff ID, or subject..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Employment Types</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="visiting">Visiting</option>
          </select>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Subjects</option>
            <option value="mathematics">Mathematics</option>
            <option value="english">English</option>
            <option value="science">Sciences</option>
          </select>
        </div>
      </div>

      {/* Tab filters */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {(['all', 'active', 'on_leave', 'suspended'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.replace('_', ' ')}
            <span className="ml-1.5 text-xs text-gray-400">
              ({tab === 'all' ? teachers.length : teachers.filter(t => t.status === tab).length})
            </span>
          </button>
        ))}
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Teacher</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Subjects</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Classes</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Type</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Rating</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Status</th>
              <th className="px-4 py-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((teacher, i) => {
              const StatusIcon = STATUS_CONFIG[teacher.status].icon
              return (
                <tr
                  key={teacher.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTeacher(teacher)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${teacher.color} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                        {teacher.profileInitials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{teacher.name}</div>
                        <div className="text-xs text-gray-500">{teacher.staffId}</div>
                        {teacher.formClass && (
                          <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                            <GraduationCap className="w-3 h-3" />
                            Form Teacher · {teacher.formClass}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map(s => (
                        <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes.slice(0, 2).map(c => (
                        <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                      {teacher.classes.length > 2 && (
                        <span className="text-xs text-gray-400">+{teacher.classes.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-gray-600">{EMPLOYMENT_LABELS[teacher.employmentType]}</span>
                  </td>
                  <td className="px-4 py-4">
                    <StarRating rating={teacher.averageRating} />
                    <div className="text-xs text-gray-400 mt-0.5">{teacher.cpdPoints} CPD pts</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_CONFIG[teacher.status].bg} ${STATUS_CONFIG[teacher.status].color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {STATUS_CONFIG[teacher.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No teachers found</p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Showing {filtered.length} of {teachers.length} teachers</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* Teacher Detail Panel */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${selectedTeacher.color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                  {selectedTeacher.profileInitials}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedTeacher.name}</h2>
                  <p className="text-sm text-gray-500">{selectedTeacher.staffId}</p>
                  <StarRating rating={selectedTeacher.averageRating} />
                </div>
              </div>
              <button onClick={() => setSelectedTeacher(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Send Message', icon: Mail, color: 'text-blue-600 bg-blue-50' },
                  { label: 'View Performance', icon: BarChart2, color: 'text-purple-600 bg-purple-50' },
                  { label: 'Edit Profile', icon: Edit, color: 'text-emerald-600 bg-emerald-50' },
                ].map(action => {
                  const Icon = action.icon
                  return (
                    <button key={action.label} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${action.color} hover:opacity-80 transition-opacity`}>
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{action.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{selectedTeacher.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{selectedTeacher.phone}</span>
                  </div>
                </div>
              </div>

              {/* Teaching Load */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Teaching Load</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-blue-700">{selectedTeacher.subjects.length}</div>
                    <div className="text-xs text-blue-600">Subjects</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedTeacher.subjects.map(s => (
                        <span key={s} className="text-xs bg-white text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-purple-700">{selectedTeacher.classes.length}</div>
                    <div className="text-xs text-purple-600">Classes</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedTeacher.classes.slice(0, 3).map(c => (
                        <span key={c} className="text-xs bg-white text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {selectedTeacher.formClass && (
                  <div className="mt-3 bg-emerald-50 rounded-xl p-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs text-emerald-600">Form Class</div>
                      <div className="text-sm font-semibold text-emerald-700">{selectedTeacher.formClass}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* CPD & Performance */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Professional Development</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">CPD Points</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTeacher.cpdPoints} pts</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((selectedTeacher.cpdPoints / 120) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">Target: 120 points per year</div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Average Performance Rating</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTeacher.averageRating}/5.0</span>
                  </div>
                  <StarRating rating={selectedTeacher.averageRating} />
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Qualifications</h3>
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{selectedTeacher.qualifications}</span>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium ${STATUS_CONFIG[selectedTeacher.status].bg} ${STATUS_CONFIG[selectedTeacher.status].color}`}>
                  {STATUS_CONFIG[selectedTeacher.status].label}
                </span>
                <span className="text-xs text-gray-400">
                  Joined {new Date(selectedTeacher.dateOfEmployment).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
