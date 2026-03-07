'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = {
  label: string
  href: string
  icon: string
  badge?: number | string
}

type NavGroup = {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
      { label: 'Notifications', href: '/dashboard/notifications', icon: '🔔' },
    ],
  },
  {
    title: 'Academic',
    items: [
      { label: 'Classes & Timetable', href: '/dashboard/academic', icon: '📅' },
      { label: 'Attendance', href: '/dashboard/attendance', icon: '☑️' },
      { label: 'Assignments', href: '/dashboard/assignments', icon: '📝' },
      { label: 'Examinations', href: '/dashboard/exams', icon: '📋' },
      { label: 'Results & Reports', href: '/dashboard/results', icon: '📊' },
      { label: 'Live Classes', href: '/dashboard/live-class', icon: '🎥' },
    ],
  },
  {
    title: 'Students & Parents',
    items: [
      { label: 'Students', href: '/dashboard/students', icon: '👨‍🎓' },
      { label: 'Parents', href: '/dashboard/parents', icon: '👨‍👩‍👧' },
      { label: 'Admissions', href: '/dashboard/admissions', icon: '📥' },
      { label: 'Social Hub', href: '/dashboard/social', icon: '💬' },
      { label: 'Gamification', href: '/dashboard/gamification', icon: '🏆' },
    ],
  },
  {
    title: 'Staff & HR',
    items: [
      { label: 'Teachers', href: '/dashboard/teachers', icon: '👩‍🏫' },
      { label: 'Staff Directory', href: '/dashboard/staff', icon: '👥' },
      { label: 'Leave Management', href: '/dashboard/leave', icon: '🏖️' },
      { label: 'Payroll', href: '/dashboard/payroll', icon: '💰' },
      { label: 'Performance', href: '/dashboard/hr', icon: '📈' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Fee Management', href: '/dashboard/fees', icon: '💳' },
      { label: 'Accounting', href: '/dashboard/accounting', icon: '📒' },
      { label: 'Reports', href: '/dashboard/financial-reports', icon: '📑' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Transport', href: '/dashboard/transport', icon: '🚌' },
      { label: 'Hostel/Boarding', href: '/dashboard/hostel', icon: '🏨' },
      { label: 'Cafeteria', href: '/dashboard/cafeteria', icon: '🍽️' },
      { label: 'Library', href: '/dashboard/library', icon: '📚' },
      { label: 'Store & Inventory', href: '/dashboard/store', icon: '📦' },
      { label: 'Maintenance', href: '/dashboard/maintenance', icon: '🔧' },
      { label: 'Health & Medical', href: '/dashboard/health', icon: '🏥' },
      { label: 'ICT Support', href: '/dashboard/ict-support', icon: '💻' },
      { label: 'Security', href: '/dashboard/security', icon: '🔒' },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { label: 'Events', href: '/dashboard/events', icon: '📅' },
      { label: 'Sports', href: '/dashboard/sports', icon: '⚽' },
      { label: 'Alumni', href: '/dashboard/alumni', icon: '🎓' },
      { label: 'Communication', href: '/dashboard/communication', icon: '📢' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'School Settings', href: '/dashboard/settings', icon: '⚙️' },
      { label: 'User Roles', href: '/dashboard/roles', icon: '🛡️' },
      { label: 'Audit Logs', href: '/dashboard/audit-logs', icon: '🔍' },
      { label: 'Branches', href: '/dashboard/branches', icon: '🏢' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredGroups = searchQuery
    ? NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      })).filter((group) => group.items.length > 0)
    : NAV_GROUPS

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div
      className={`flex flex-col bg-gray-950 text-gray-300 border-r border-gray-800 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } h-screen sticky top-0 overflow-hidden`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
              E
            </div>
            <span className="font-bold text-white text-base">EduSuite</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none flex-1"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700">
        {filteredGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-1">
                {group.title}
              </p>
            )}
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all mb-0.5 group ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className={`text-base flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`}>{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* User Profile at bottom */}
      {!collapsed && (
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Admin User</p>
              <p className="text-gray-500 text-xs truncate">Branch Admin</p>
            </div>
            <button className="text-gray-500 hover:text-white text-xs">⚙️</button>
          </div>
        </div>
      )}
    </div>
  )
}
