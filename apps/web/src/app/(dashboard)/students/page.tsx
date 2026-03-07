'use client'

import { useState } from 'react'
import {
  Users, Search, Plus, Filter, Star, Book, Award, UserCheck,
  TrendingUp, Clock, ChevronRight, MoreHorizontal, Mail, Phone,
  GraduationCap, CheckCircle, AlertCircle, XCircle, Calendar,
  Download, Eye, Edit, BarChart2, ArrowUpDown, Printer,
  Heart, BookOpen, Zap, Shield, MessageSquare
} from 'lucide-react'

type Status = 'active' | 'graduated' | 'withdrawn' | 'suspended'
type Gender = 'male' | 'female'
type Tab = 'all' | 'active' | 'graduated' | 'suspended'

interface Student {
  id: string
  admissionNumber: string
  name: string
  email: string
  phone: string
  gender: Gender
  dateOfBirth: string
  currentClass: string
  section: string
  parentName: string
  parentPhone: string
  bloodGroup: string
  status: Status
  admissionDate: string
  attendanceRate: number
  averageScore: number
  feeStatus: 'paid' | 'partial' | 'unpaid'
  initials: string
  color: string
}

const MOCK_STUDENTS: Student[] = [
  {
    id: '1', admissionNumber: 'STU/24/0001', name: 'Adewale Babatunde Johnson',
    email: 'adewale@student.edu', phone: '+234 810 234 5678', gender: 'male',
    dateOfBirth: '2007-03-15', currentClass: 'SS 2', section: 'A',
    parentName: 'Mr. Emmanuel Johnson', parentPhone: '+234 802 345 6789',
    bloodGroup: 'O+', status: 'active', admissionDate: '2019-09-01',
    attendanceRate: 94, averageScore: 78.5, feeStatus: 'paid',
    initials: 'AJ', color: 'bg-blue-500',
  },
  {
    id: '2', admissionNumber: 'STU/24/0002', name: 'Chioma Blessing Eze',
    email: 'chioma@student.edu', phone: '+234 803 456 7890', gender: 'female',
    dateOfBirth: '2006-11-20', currentClass: 'SS 3', section: 'A',
    parentName: 'Mrs. Ngozi Eze', parentPhone: '+234 805 567 8901',
    bloodGroup: 'A+', status: 'active', admissionDate: '2018-09-01',
    attendanceRate: 98, averageScore: 91.2, feeStatus: 'paid',
    initials: 'CE', color: 'bg-purple-500',
  },
  {
    id: '3', admissionNumber: 'STU/24/0003', name: 'Ibrahim Umar Musa',
    email: 'ibrahim@student.edu', phone: '+234 806 678 9012', gender: 'male',
    dateOfBirth: '2008-07-04', currentClass: 'SS 2', section: 'B',
    parentName: 'Alhaji Umar Musa', parentPhone: '+234 808 789 0123',
    bloodGroup: 'B+', status: 'active', admissionDate: '2019-09-01',
    attendanceRate: 87, averageScore: 72.8, feeStatus: 'partial',
    initials: 'IM', color: 'bg-emerald-500',
  },
  {
    id: '4', admissionNumber: 'STU/24/0004', name: 'Fatima Aisha Ibrahim',
    email: 'fatima@student.edu', phone: '+234 807 890 1234', gender: 'female',
    dateOfBirth: '2007-01-25', currentClass: 'SS 2', section: 'A',
    parentName: 'Mr. Sani Ibrahim', parentPhone: '+234 809 901 2345',
    bloodGroup: 'AB+', status: 'active', admissionDate: '2019-09-01',
    attendanceRate: 96, averageScore: 85.0, feeStatus: 'paid',
    initials: 'FI', color: 'bg-orange-500',
  },
  {
    id: '5', admissionNumber: 'STU/24/0005', name: 'Olumide Tunde Adeyemi',
    email: 'olumide@student.edu', phone: '+234 801 234 5678', gender: 'male',
    dateOfBirth: '2007-09-12', currentClass: 'JSS 3', section: 'B',
    parentName: 'Mrs. Folake Adeyemi', parentPhone: '+234 803 345 6789',
    bloodGroup: 'O-', status: 'suspended', admissionDate: '2020-09-01',
    attendanceRate: 68, averageScore: 55.3, feeStatus: 'unpaid',
    initials: 'OA', color: 'bg-red-400',
  },
  {
    id: '6', admissionNumber: 'STU/23/0067', name: 'Blessing Chukwu Nwosu',
    email: 'blessing@alumni.edu', phone: '+234 811 345 6789', gender: 'female',
    dateOfBirth: '2005-05-18', currentClass: 'SS 3', section: 'A',
    parentName: 'Chief Chukwu Nwosu', parentPhone: '+234 815 456 7890',
    bloodGroup: 'A-', status: 'graduated', admissionDate: '2017-09-01',
    attendanceRate: 99, averageScore: 94.7, feeStatus: 'paid',
    initials: 'BN', color: 'bg-amber-500',
  },
]

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  graduated: { label: 'Graduated', color: 'text-blue-700', bg: 'bg-blue-100' },
  withdrawn: { label: 'Withdrawn', color: 'text-gray-700', bg: 'bg-gray-100' },
  suspended: { label: 'Suspended', color: 'text-red-700', bg: 'bg-red-100' },
}

const FEE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: 'Paid', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  partial: { label: 'Partial', color: 'text-amber-700', bg: 'bg-amber-100' },
  unpaid: { label: 'Unpaid', color: 'text-red-700', bg: 'bg-red-100' },
}

export default function StudentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [students] = useState<Student[]>(MOCK_STUDENTS)
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [sortField, setSortField] = useState<string>('name')

  const filtered = students.filter(s => {
    const matchesTab = activeTab === 'all' || s.status === activeTab
    const matchesSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(search.toLowerCase()) ||
      `${s.currentClass}${s.section}`.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    male: students.filter(s => s.gender === 'male').length,
    female: students.filter(s => s.gender === 'female').length,
    feeDefaulters: students.filter(s => s.feeStatus !== 'paid' && s.status === 'active').length,
    avgAttendance: Math.round(students.filter(s => s.status === 'active').reduce((a, s) => a + s.attendanceRate, 0) / students.filter(s => s.status === 'active').length),
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">Manage student records, classes, and progress</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Enroll Student
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total Students', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50', icon: Users },
          { label: 'Active', value: stats.active, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
          { label: 'Male', value: stats.male, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: UserCheck },
          { label: 'Female', value: stats.female, color: 'text-pink-600', bg: 'bg-pink-50', icon: UserCheck },
          { label: 'Fee Defaulters', value: stats.feeDefaulters, color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
          { label: 'Avg Attendance', value: `${stats.avgAttendance}%`, color: 'text-teal-600', bg: 'bg-teal-50', icon: Calendar },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, admission number, or class..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Classes</option>
            <option>JSS 1</option><option>JSS 2</option><option>JSS 3</option>
            <option>SS 1</option><option>SS 2</option><option>SS 3</option>
          </select>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Fee Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {(['all', 'active', 'graduated', 'suspended'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            <span className="ml-1.5 text-xs text-gray-400">
              ({tab === 'all' ? students.length : students.filter(s => s.status === tab).length})
            </span>
          </button>
        ))}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Student</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Class</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Parent/Guardian</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Attendance</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Avg Score</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Fees</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Status</th>
              <th className="px-4 py-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(student => (
              <tr
                key={student.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedStudent(student)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${student.color} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                      {student.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.admissionNumber}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-medium text-gray-700">{student.currentClass}{student.section}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-700">{student.parentName}</div>
                  <div className="text-xs text-gray-400">{student.parentPhone}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${student.attendanceRate >= 90 ? 'bg-emerald-500' : student.attendanceRate >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${student.attendanceRate}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-700">{student.attendanceRate}%</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-sm font-medium ${student.averageScore >= 70 ? 'text-emerald-700' : student.averageScore >= 50 ? 'text-amber-700' : 'text-red-700'}`}>
                    {student.averageScore}%
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${FEE_CONFIG[student.feeStatus].bg} ${FEE_CONFIG[student.feeStatus].color}`}>
                    {FEE_CONFIG[student.feeStatus].label}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_CONFIG[student.status].bg} ${STATUS_CONFIG[student.status].color}`}>
                    {STATUS_CONFIG[student.status].label}
                  </span>
                </td>
                <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No students found</p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Showing {filtered.length} of {students.length} students</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* Student Detail Panel */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${selectedStudent.color} rounded-xl flex items-center justify-center text-white font-bold text-xl`}>
                  {selectedStudent.initials}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedStudent.name}</h2>
                  <p className="text-sm text-gray-500">{selectedStudent.admissionNumber}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CONFIG[selectedStudent.status].bg} ${STATUS_CONFIG[selectedStudent.status].color}`}>
                    {STATUS_CONFIG[selectedStudent.status].label}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
            </div>
            <div className="p-6 space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Message', icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Report', icon: BarChart2, color: 'text-purple-600 bg-purple-50' },
                  { label: 'Print ID', icon: Printer, color: 'text-teal-600 bg-teal-50' },
                  { label: 'Edit', icon: Edit, color: 'text-gray-600 bg-gray-50' },
                ].map(a => {
                  const Icon = a.icon
                  return (
                    <button key={a.label} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl ${a.color} hover:opacity-80 transition-opacity`}>
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{a.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-blue-700">{selectedStudent.attendanceRate}%</div>
                  <div className="text-xs text-blue-600">Attendance</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-700">{selectedStudent.averageScore}%</div>
                  <div className="text-xs text-emerald-600">Avg Score</div>
                </div>
                <div className={`${FEE_CONFIG[selectedStudent.feeStatus].bg} rounded-xl p-3 text-center`}>
                  <div className={`text-base font-bold ${FEE_CONFIG[selectedStudent.feeStatus].color}`}>
                    {FEE_CONFIG[selectedStudent.feeStatus].label}
                  </div>
                  <div className="text-xs text-gray-500">Fees</div>
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Personal Information</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Class', value: `${selectedStudent.currentClass}${selectedStudent.section}` },
                    { label: 'Gender', value: selectedStudent.gender.charAt(0).toUpperCase() + selectedStudent.gender.slice(1) },
                    { label: 'Date of Birth', value: new Date(selectedStudent.dateOfBirth).toLocaleDateString('en-GB') },
                    { label: 'Blood Group', value: selectedStudent.bloodGroup },
                    { label: 'Email', value: selectedStudent.email },
                    { label: 'Phone', value: selectedStudent.phone },
                    { label: 'Admission Date', value: new Date(selectedStudent.admissionDate).toLocaleDateString('en-GB') },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <span className="text-sm text-gray-900 font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parent Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Parent/Guardian</h3>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-sm font-medium text-gray-900">{selectedStudent.parentName}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedStudent.parentPhone}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
