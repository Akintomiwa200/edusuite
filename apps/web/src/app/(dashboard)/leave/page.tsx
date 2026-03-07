'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { FullLeaveType, LeaveStatus } from '@edusuite/shared-types'

const LEAVE_TYPE_META: Record<string, { label: string; color: string }> = {
  ANNUAL: { label: 'Annual Leave', color: 'bg-green-100 text-green-800' },
  SICK: { label: 'Sick Leave', color: 'bg-red-100 text-red-800' },
  EMERGENCY_SICK: { label: 'Emergency Sick', color: 'bg-red-200 text-red-900' },
  MATERNITY: { label: 'Maternity', color: 'bg-pink-100 text-pink-800' },
  PATERNITY: { label: 'Paternity', color: 'bg-blue-100 text-blue-800' },
  CASUAL: { label: 'Casual', color: 'bg-orange-100 text-orange-800' },
  BEREAVEMENT: { label: 'Bereavement', color: 'bg-gray-100 text-gray-800' },
  STUDY: { label: 'Study Leave', color: 'bg-purple-100 text-purple-800' },
  UNPAID: { label: 'Unpaid', color: 'bg-yellow-100 text-yellow-800' },
  WEDDING: { label: 'Wedding', color: 'bg-rose-100 text-rose-800' },
  HALF_DAY: { label: 'Half Day', color: 'bg-teal-100 text-teal-800' },
  RELIGIOUS: { label: 'Religious', color: 'bg-indigo-100 text-indigo-800' },
}

const STATUS_META: Record<string, { label: string; dot: string }> = {
  PENDING: { label: 'Pending', dot: 'bg-yellow-400' },
  PENDING_SUPERVISOR: { label: 'Awaiting Supervisor', dot: 'bg-yellow-400' },
  PENDING_ACADEMIC_HEAD: { label: 'Awaiting Academic Head', dot: 'bg-yellow-500' },
  PENDING_HR: { label: 'Awaiting HR', dot: 'bg-orange-400' },
  PENDING_BRANCH_ADMIN: { label: 'Awaiting Admin', dot: 'bg-orange-500' },
  APPROVED: { label: 'Approved', dot: 'bg-green-500' },
  REJECTED: { label: 'Rejected', dot: 'bg-red-500' },
  CANCELLED: { label: 'Cancelled', dot: 'bg-gray-400' },
  RECALLED: { label: 'Recalled', dot: 'bg-red-600' },
}

export default function LeaveManagementPage() {
  const queryClient = useQueryClient()
  const [view, setView] = useState<'my-leaves' | 'balances' | 'calendar' | 'pending-approvals' | 'analytics'>('my-leaves')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear] = useState(new Date().getFullYear())

  const { data: myLeaves } = useQuery({
    queryKey: ['leave', 'my-requests'],
    queryFn: () => apiClient.get('/leave/my-requests'),
  })

  const { data: balances } = useQuery({
    queryKey: ['leave', 'balances', selectedYear],
    queryFn: () => apiClient.get(`/leave/balance?year=${selectedYear}`),
  })

  const { data: pendingApprovals } = useQuery({
    queryKey: ['leave', 'pending-approvals'],
    queryFn: () => apiClient.get('/leave/pending-approvals'),
  })

  const { data: analytics } = useQuery({
    queryKey: ['leave', 'analytics', selectedYear],
    queryFn: () => apiClient.get(`/leave/analytics?year=${selectedYear}`),
    enabled: view === 'analytics',
  })

  const { data: calendar } = useQuery({
    queryKey: ['leave', 'calendar', selectedMonth, selectedYear],
    queryFn: () => apiClient.get(`/leave/calendar?month=${selectedMonth}&year=${selectedYear}`),
    enabled: view === 'calendar',
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      apiClient.patch(`/leave/${id}/approve`, { comment }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.patch(`/leave/${id}/reject`, { reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave'] }),
  })

  const leaves: any[] = myLeaves?.data || []
  const leaveBalances: any[] = balances?.data || []
  const approvals: any[] = pendingApprovals?.data || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage leave requests, balances, and approvals</p>
          </div>
          <a
            href="/dashboard/leave/apply"
            className="inline-flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Apply for Leave
          </a>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mt-6 border border-gray-200 bg-gray-100 rounded-xl p-1 w-fit">
          {[
            { key: 'my-leaves', label: 'My Leaves' },
            { key: 'balances', label: 'Balances' },
            { key: 'calendar', label: 'Calendar' },
            { key: 'pending-approvals', label: `Approvals ${approvals.length > 0 ? `(${approvals.length})` : ''}` },
            { key: 'analytics', label: 'Analytics' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === tab.key
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* My Leaves */}
        {view === 'my-leaves' && (
          <div className="space-y-4">
            {leaves.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-gray-700 font-semibold text-lg mb-2">No leave requests</h3>
                <p className="text-gray-400 text-sm mb-6">Submit your first leave request to get started</p>
                <a href="/dashboard/leave/apply" className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-800 inline-block">
                  Apply Now
                </a>
              </div>
            ) : (
              leaves.map((req) => {
                const typeMeta = LEAVE_TYPE_META[req.leaveType] || { label: req.leaveType, color: 'bg-gray-100 text-gray-800' }
                const statusMeta = STATUS_META[req.status] || { label: req.status, dot: 'bg-gray-400' }

                return (
                  <div key={req._id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeMeta.color}`}>
                          {typeMeta.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
                          <span className="text-sm text-gray-500">{statusMeta.label}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">{req.durationDays} working day(s)</span>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(req.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' → '}
                        {new Date(req.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <p className="text-sm text-gray-500 mt-2 leading-relaxed">{req.reason}</p>
                    </div>

                    {req.hasConflict && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-orange-700 bg-orange-50 rounded-lg px-3 py-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Staffing conflict: {req.conflictDetails?.[0]}
                      </div>
                    )}

                    {req.rejectionReason && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Rejected: {req.rejectionReason}
                      </div>
                    )}

                    {/* Approval History */}
                    {req.approvalHistory?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-2">Approval Progress</p>
                        <div className="flex gap-2">
                          {req.approvalHistory.map((entry: any, i: number) => (
                            <div key={i} className={`text-xs px-2 py-1 rounded-md ${
                              entry.action === 'APPROVED' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {entry.level} ✓
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Leave Balances */}
        {view === 'balances' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {leaveBalances.length === 0 ? (
                <p className="text-gray-400 col-span-3 text-center py-12">No leave balances found for {selectedYear}</p>
              ) : (
                leaveBalances.map((bal, i) => {
                  const typeMeta = LEAVE_TYPE_META[bal.leaveType] || { label: bal.leaveType, color: '' }
                  const usedPercent = Math.min(100, ((bal.usedDays || 0) / (bal.totalDays + bal.carriedOverDays || 1)) * 100)

                  return (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">{typeMeta.label}</h3>
                          {bal.carriedOverDays > 0 && (
                            <p className="text-xs text-blue-500 mt-0.5">+{bal.carriedOverDays} days carried over</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-blue-700">{bal.availableDays}</p>
                          <p className="text-xs text-gray-400">available</p>
                        </div>
                      </div>

                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${usedPercent}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Used: <strong className="text-gray-700">{bal.usedDays}</strong></span>
                        {bal.pendingDays > 0 && (
                          <span className="text-orange-500">Pending: <strong>{bal.pendingDays}</strong></span>
                        )}
                        <span>Total: <strong className="text-gray-700">{bal.totalDays + bal.carriedOverDays}</strong></span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Pending Approvals */}
        {view === 'pending-approvals' && (
          <div className="space-y-4">
            {approvals.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-gray-700 font-semibold text-lg">All caught up!</h3>
                <p className="text-gray-400 text-sm mt-1">No pending leave approvals</p>
              </div>
            ) : (
              approvals.map((req) => (
                <div key={req._id} className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                      {req.user?.firstName?.[0]}{req.user?.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{req.user?.firstName} {req.user?.lastName}</h4>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${LEAVE_TYPE_META[req.leaveType]?.color || 'bg-gray-100'}`}>
                          {LEAVE_TYPE_META[req.leaveType]?.label || req.leaveType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(req.startDate).toLocaleDateString()} → {new Date(req.endDate).toLocaleDateString()} ({req.durationDays} days)
                      </p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{req.reason}</p>

                      {req.hasConflict && (
                        <div className="mt-2 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
                          ⚠ Staffing below minimum on requested dates
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => approveMutation.mutate({ id: req._id })}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Rejection reason:')
                        if (reason) rejectMutation.mutate({ id: req._id, reason })
                      }}
                      disabled={rejectMutation.isPending}
                      className="flex-1 bg-red-50 text-red-700 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Analytics */}
        {view === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Leave by Type</h3>
              {analytics?.data?.byType?.map((item: any) => (
                <div key={item._id} className="flex items-center gap-3 mb-3">
                  <span className="text-sm text-gray-600 w-36 truncate">
                    {LEAVE_TYPE_META[item._id]?.label || item._id}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, (item.count / (analytics?.data?.byType?.reduce((s: number, i: any) => s + i.count, 0) || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Monthly Trend ({selectedYear})</h3>
              {analytics?.data?.byMonth?.map((item: any) => {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                return (
                  <div key={item._id.month} className="flex items-center gap-3 mb-3">
                    <span className="text-sm text-gray-600 w-8">{months[item._id.month - 1]}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, item.count * 5)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-8 text-right">{item.count}</span>
                  </div>
                )
              })}
            </div>

            {analytics?.data?.costAnalysis && (
              <div className="bg-blue-700 text-white rounded-2xl p-6">
                <h3 className="font-bold mb-2">Substitute Teacher Cost</h3>
                <p className="text-4xl font-black">
                  ₦{analytics.data.costAnalysis.totalCost?.toLocaleString() || '0'}
                </p>
                <p className="text-blue-200 text-sm mt-1">
                  {analytics.data.costAnalysis.totalSubstitutions || 0} substitutions this year
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
