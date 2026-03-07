'use client'

import { useState } from 'react'
import {
  Utensils,
  Calendar,
  Users,
  Search,
  Filter,
} from 'lucide-react'

interface MenuItem {
  id: string
  day: string
  mealType: 'Breakfast' | 'Lunch' | 'Snack'
  main: string
  side: string
  calories: number
}

const MOCK_MENU: MenuItem[] = [
  {
    id: 'CF-01',
    day: 'Monday',
    mealType: 'Lunch',
    main: 'Jollof rice & grilled chicken',
    side: 'Mixed salad & water',
    calories: 780,
  },
  {
    id: 'CF-02',
    day: 'Tuesday',
    mealType: 'Lunch',
    main: 'Beans & plantain',
    side: 'Fruit cup & juice',
    calories: 650,
  },
  {
    id: 'CF-03',
    day: 'Wednesday',
    mealType: 'Lunch',
    main: 'Pasta & tomato stew',
    side: 'Cucumber salad',
    calories: 720,
  },
]

export default function CafeteriaPage() {
  const [dayFilter, setDayFilter] = useState<'All' | 'Monday' | 'Tuesday' | 'Wednesday'>(
    'All'
  )

  const filtered = MOCK_MENU.filter((m) =>
    dayFilter === 'All' ? true : m.day === dayFilter
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cafeteria</h1>
          <p className="text-sm text-gray-500 mt-1">
            Plan termly menus, manage dietary preferences, and coordinate student meals.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            Download Menu
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <Utensils className="w-4 h-4" />
            Add Meal
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Meals this week
            </p>
            <p className="text-xl font-bold text-gray-900">{MOCK_MENU.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Estimated Daily Servings
            </p>
            <p className="text-xl font-bold text-gray-900">820</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Menu Cycle
            </p>
            <p className="text-sm font-semibold text-gray-900">
              4‑week rotating menu
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search by meal or side..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              {(['All', 'Monday', 'Tuesday', 'Wednesday'] as const).map((day) => (
                <button
                  key={day}
                  onClick={() => setDayFilter(day)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium ${
                    dayFilter === day
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              <Filter className="w-3.5 h-3.5" />
              Dietary filters
            </button>
          </div>
        </div>
      </div>

      {/* Menu table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Day
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Meal
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Side
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Calories
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr
                key={m.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{m.day}</span>
                    <span className="text-xs text-gray-500">{m.mealType}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{m.main}</td>
                <td className="px-4 py-3 text-gray-700">{m.side}</td>
                <td className="px-4 py-3 text-gray-700">{m.calories} kcal</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No meals configured for this selection yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
