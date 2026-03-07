'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

const PIPELINE_STAGES = [
  { key: 'NEW', label: 'New Enquiry', color: '#6366F1', count: 0 },
  { key: 'CONTACTED', label: 'Contacted', color: '#3B82F6', count: 0 },
  { key: 'TOUR_SCHEDULED', label: 'Tour Scheduled', color: '#8B5CF6', count: 0 },
  { key: 'APPLIED', label: 'Applied', color: '#F59E0B', count: 0 },
  { key: 'UNDER_REVIEW', label: 'Under Review', color: '#F97316', count: 0 },
  { key: 'OFFER_MADE', label: 'Offer Made', color: '#10B981', count: 0 },
  { key: 'ACCEPTED', label: 'Accepted ✓', color: '#059669', count: 0 },
  { key: 'REJECTED', label: 'Rejected', color: '#EF4444', count: 0 },
]

export default function AdmissionsPage() {
  const [view, setView] = useState<'pipeline' | 'enquiries' | 'applications'>('pipeline')
  const [showNewEnquiry, setShowNewEnquiry] = useState(false)

  const { data: enquiries } = useQuery({
    queryKey: ['admissions', 'enquiries'],
    queryFn: () => apiClient.get('/admissions/enquiries'),
  })

  const { data: applications } = useQuery({
    queryKey: ['admissions', 'applications'],
    queryFn: () => apiClient.get('/admissions/applications'),
  })

  const enquiryList: any[] = enquiries?.data || []
  const applicationList: any[] = applications?.data || []

  // Count by stage
  const stagesWithCount = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: [...enquiryList, ...applicationList].filter((item) => item.status === stage.key).length,
  }))

  const getStatusColor = (status: string) => {
    const stage = PIPELINE_STAGES.find((s) => s.key === status)
    return stage?.color || '#6B7280'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admissions</h1>
            <p className="text-sm text-gray-500 mt-1">Manage prospects, applications, and enrollment</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNewEnquiry(true)}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-50"
            >
              Add Enquiry
            </button>
            <a
              href="/dashboard/admissions/application/new"
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700"
            >
              New Application
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 border border-gray-200 bg-gray-100 rounded-xl p-1 w-fit">
          {[
            { key: 'pipeline', label: 'Pipeline View' },
            { key: 'enquiries', label: `Enquiries (${enquiryList.length})` },
            { key: 'applications', label: `Applications (${applicationList.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === tab.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Enquiries', value: enquiryList.length, icon: '📋', color: 'bg-blue-50 text-blue-700' },
            { label: 'Applications', value: applicationList.length, icon: '📄', color: 'bg-purple-50 text-purple-700' },
            { label: 'Offers Made', value: applicationList.filter((a) => a.status === 'OFFER_MADE').length, icon: '📮', color: 'bg-green-50 text-green-700' },
            { label: 'Enrolled This Year', value: applicationList.filter((a) => a.enrolled).length, icon: '🎓', color: 'bg-yellow-50 text-yellow-700' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${card.color}`}>
                {card.icon}
              </div>
              <p className="text-3xl font-black text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Pipeline View */}
        {view === 'pipeline' && (
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max pb-4">
              {stagesWithCount.map((stage) => {
                const stageItems = [...enquiryList, ...applicationList].filter((item) => item.status === stage.key)

                return (
                  <div key={stage.key} className="w-72 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                        <h3 className="font-semibold text-gray-800 text-sm">{stage.label}</h3>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {stage.count}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {stageItems.map((item) => (
                        <div key={item._id} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                          <p className="font-semibold text-gray-900 text-sm">
                            {item.childName || `${item.firstName} ${item.lastName}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.parentName || item.guardianName}
                          </p>
                          {item.targetClass && (
                            <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded mt-2 inline-block">
                              Target: {item.targetClass}
                            </span>
                          )}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                            <span className="text-xs text-gray-400">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            {item.nextFollowUpDate && (
                              <span className="text-xs text-orange-500">
                                Follow-up: {new Date(item.nextFollowUpDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {stageItems.length === 0 && (
                        <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-dashed border-gray-200">
                          <p className="text-xs text-gray-400">No prospects here</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Enquiries Table */}
        {view === 'enquiries' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Parent', 'Child', 'Phone', 'Target Class', 'Source', 'Follow-up', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enquiryList.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.parentName}</p>
                        <p className="text-xs text-gray-400">{item.parentEmail}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{item.childName}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{item.parentPhone}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{item.targetClass || '—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500">{item.howDidYouHear || '—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {item.nextFollowUpDate ? new Date(item.nextFollowUpDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: getStatusColor(item.status) + '20', color: getStatusColor(item.status) }}
                      >
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">View</button>
                        <button className="text-xs text-gray-500 hover:text-gray-700 font-medium">Log Call</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {enquiryList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                      No enquiries yet. Add your first enquiry to start the pipeline.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Applications Table */}
        {view === 'applications' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['App No.', 'Applicant', 'Guardian', 'Class', 'Exam Score', 'Interview', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applicationList.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{app.applicationNumber}</td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{app.firstName} {app.lastName}</p>
                        <p className="text-xs text-gray-400">{new Date(app.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{app.guardianName}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{app.targetClass}</td>
                    <td className="px-5 py-4 text-sm">
                      {app.entranceExamScore != null ? (
                        <span className={`font-bold ${app.entranceExamScore >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                          {app.entranceExamScore}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {app.interviewScore != null ? (
                        <span className="font-bold text-blue-600">{app.interviewScore}/100</span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: getStatusColor(app.status) + '20', color: getStatusColor(app.status) }}
                      >
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">Review</button>
                        {app.status === 'UNDER_REVIEW' && (
                          <button className="text-xs text-green-600 hover:text-green-800 font-medium">Make Offer</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {applicationList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                      No applications yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
