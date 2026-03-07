'use client'

import { useState } from 'react'
import {
  Package,
  Layers3,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  category: string
  stock: number
  reorderLevel: number
}

const MOCK_STOCK: InventoryItem[] = [
  {
    id: 'INV-001',
    name: 'Exercise Books (80 pages)',
    category: 'Stationery',
    stock: 420,
    reorderLevel: 200,
  },
  {
    id: 'INV-002',
    name: 'School Uniform – Boys (Size 12)',
    category: 'Uniform',
    stock: 35,
    reorderLevel: 50,
  },
  {
    id: 'INV-003',
    name: 'Mathematics Textbook – JSS 2',
    category: 'Textbooks',
    stock: 12,
    reorderLevel: 40,
  },
]

export default function StorePage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_STOCK.filter((i) => {
    const q = search.toLowerCase()
    return (
      !q ||
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q)
    )
  })

  const lowStock = MOCK_STOCK.filter((i) => i.stock <= i.reorderLevel).length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store & Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track school store items, uniform stock, and low‑stock alerts.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <Layers3 className="w-4 h-4" />
            Categories
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <Package className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Tracked Items
            </p>
            <p className="text-xl font-bold text-gray-900">{MOCK_STOCK.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Low Stock Alerts
            </p>
            <p className="text-xl font-bold text-gray-900">{lowStock}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Layers3 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Main Categories
            </p>
            <p className="text-sm font-semibold text-gray-900">
              Stationery, Uniforms, Textbooks
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by item name, category, or ID..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Filter className="w-3.5 h-3.5" />
            Filter by category
          </button>
        </div>
      </div>

      {/* Stock table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Item
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Category
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                Stock
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => {
              const isLow = i.stock <= i.reorderLevel
              const color = isLow ? 'text-red-600' : 'text-emerald-600'

              return (
                <tr
                  key={i.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{i.name}</span>
                      <span className="text-xs text-gray-500">{i.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{i.category}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${color}`}>{i.stock}</span>
                    <span className="text-xs text-gray-400 ml-1">
                      (reorder {i.reorderLevel})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
                      Adjust stock
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No inventory items match your search yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
