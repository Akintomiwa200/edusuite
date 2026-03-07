'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

const BADGE_ICONS: Record<string, string> = {
  ACADEMIC: '🎓',
  ATTENDANCE: '✅',
  BEHAVIOR: '⭐',
  SPORTS: '🏆',
  SOCIAL: '👥',
  SPECIAL: '🎖️',
}

const REWARD_ICONS: Record<string, string> = {
  VIRTUAL: '💎',
  PHYSICAL: '🎁',
  EXPERIENCE: '🌟',
  PRIVILEGE: '👑',
}

export default function GamificationPage() {
  const [view, setView] = useState<'leaderboard' | 'store' | 'settings' | 'houses'>('leaderboard')
  const [selectedClass, setSelectedClass] = useState('')

  const { data: leaderboard } = useQuery({
    queryKey: ['gamification', 'leaderboard', selectedClass],
    queryFn: () => apiClient.get(`/gamification/leaderboard${selectedClass ? `?classId=${selectedClass}` : ''}`),
  })

  const { data: houses } = useQuery({
    queryKey: ['gamification', 'houses'],
    queryFn: () => apiClient.get('/sports/houses'),
  })

  const { data: config } = useQuery({
    queryKey: ['gamification', 'config'],
    queryFn: () => apiClient.get('/gamification/config'),
  })

  const leaderboardData: any[] = leaderboard?.data || []
  const houseData: any[] = houses?.data || []
  const rewardStore: any[] = config?.data?.rewardStore || []
  const badges: any[] = config?.data?.badges || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">🏆 Gamification & Rewards</h1>
            <p className="text-yellow-100 text-sm mt-1">Motivate students with points, badges, and rewards</p>
          </div>
          <button className="bg-white text-orange-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-orange-50">
            Award Points
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Top Points Today', value: leaderboardData[0]?.totalPoints || 0, icon: '🌟' },
            { label: 'Badges Awarded', value: badges.length, icon: '🎖️' },
            { label: 'Rewards Claimed', value: 42, icon: '🎁' },
            { label: 'Active Houses', value: houseData.length, icon: '🏠' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-2xl">{stat.icon}</p>
              <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
              <p className="text-yellow-100 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <div className="flex gap-1 py-3 w-fit">
          {[
            { key: 'leaderboard', label: '🥇 Leaderboard' },
            { key: 'houses', label: '🏠 Houses' },
            { key: 'store', label: '🛍 Reward Store' },
            { key: 'settings', label: '⚙️ Point Rules' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key as any)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                view === tab.key ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* Leaderboard */}
        {view === 'leaderboard' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Main Leaderboard */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Top Students</h3>
                <select
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">All Classes</option>
                </select>
              </div>

              <div className="divide-y divide-gray-50">
                {leaderboardData.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <p className="text-4xl mb-3">🏆</p>
                    <p>No rankings yet. Award points to students to see the leaderboard.</p>
                  </div>
                ) : (
                  leaderboardData.slice(0, 20).map((student, index) => (
                    <div key={student._id} className={`flex items-center gap-4 p-4 hover:bg-gray-50 ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''}`}>
                      <div className={`w-8 text-center font-black text-lg ${
                        index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-gray-400'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>

                      <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {student.student?.firstName?.[0]}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {student.student?.firstName} {student.student?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{student.student?.class?.name}</p>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-1">
                        {student.badges?.slice(0, 3).map((badge: any, bi: number) => (
                          <span key={bi} title={badge.name} className="text-lg">
                            {BADGE_ICONS[badge.category] || '🏅'}
                          </span>
                        ))}
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-black text-orange-500">{student.totalPoints?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">points</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Badges Showcase */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">🎖️ Available Badges</h3>
                <div className="space-y-3">
                  {badges.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No badges configured yet</p>
                  ) : (
                    badges.map((badge, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="text-2xl">{BADGE_ICONS[badge.category] || '🏅'}</span>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{badge.name}</p>
                          <p className="text-xs text-gray-500">{badge.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Houses */}
        {view === 'houses' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {houseData.length === 0 ? (
              <div className="col-span-4 bg-white rounded-2xl p-12 text-center border border-gray-200">
                <p className="text-4xl mb-3">🏠</p>
                <p className="text-gray-500">No houses configured</p>
              </div>
            ) : (
              houseData.map((house, i) => (
                <div
                  key={house._id}
                  className="bg-white rounded-2xl p-6 border-2 text-center"
                  style={{ borderColor: house.color || '#E0E0E0' }}
                >
                  <div
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-black text-white mb-4"
                    style={{ backgroundColor: house.color || '#666' }}
                  >
                    {house.name[0]}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{house.name}</h3>
                  <p className="text-sm text-gray-400 mt-1 italic">"{house.motto}"</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-3xl font-black" style={{ color: house.color }}>{house.totalPoints}</p>
                    <p className="text-xs text-gray-400">total points</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{house.memberIds?.length || 0} members</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reward Store */}
        {view === 'store' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rewardStore.filter((r) => r.isActive).length === 0 ? (
              <div className="col-span-3 bg-white rounded-2xl p-12 text-center border border-gray-200">
                <p className="text-4xl mb-3">🛍</p>
                <p className="text-gray-500">No rewards in store yet. Configure rewards in settings.</p>
              </div>
            ) : (
              rewardStore.filter((r) => r.isActive).map((reward, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{REWARD_ICONS[reward.type] || '🎁'}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      reward.type === 'VIRTUAL' ? 'bg-purple-50 text-purple-700' :
                      reward.type === 'PHYSICAL' ? 'bg-blue-50 text-blue-700' :
                      reward.type === 'EXPERIENCE' ? 'bg-green-50 text-green-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {reward.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{reward.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{reward.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <span className="text-orange-500 font-black text-xl">{reward.pointsCost}</span>
                      <span className="text-gray-400 text-sm">pts</span>
                    </div>
                    {reward.stock != null && (
                      <span className={`text-xs font-medium ${reward.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {reward.stock > 0 ? `${reward.stock} left` : 'Out of stock'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Point Rules Settings */}
        {view === 'settings' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Point Rules Configuration</h3>
              <button className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600">
                Add Rule
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Action', 'Category', 'Points', 'Max Per Day', 'Max Per Term'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(config?.data?.pointRules || []).map((rule: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm text-gray-700">{rule.action}</td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium">{BADGE_ICONS[rule.category]} {rule.category}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-black text-orange-500">+{rule.points}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{rule.maxPerDay || '—'}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{rule.maxPerTerm || '—'}</td>
                  </tr>
                ))}
                {(config?.data?.pointRules || []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                      No point rules configured yet. Add rules to start earning points.
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
