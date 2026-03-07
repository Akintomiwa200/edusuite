'use client'

import { useState } from 'react'
import {
  DollarSign, TrendingUp, AlertCircle, Users, FileText,
  Download, Plus, Search, Filter, CheckCircle, Clock, XCircle,
  CreditCard, Wallet, Building
} from 'lucide-react'

type Tab = 'overview' | 'invoices' | 'payments' | 'fee-structures' | 'accounting' | 'defaulters'

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: Wallet },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: Building },
  { id: 'paystack', label: 'Paystack', icon: CreditCard },
  { id: 'flutterwave', label: 'Flutterwave', icon: CreditCard },
  { id: 'card', label: 'POS/Card', icon: CreditCard },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  partial: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

const MOCK_INVOICES = [
  { id: '1', invoiceNumber: 'INV/2024/00001', student: 'Adewale Johnson', class: 'SS 2A', totalAmount: 185000, balance: 0, status: 'paid', dueDate: '2024-10-31' },
  { id: '2', invoiceNumber: 'INV/2024/00002', student: 'Fatima Ibrahim', class: 'JSS 1B', totalAmount: 145000, balance: 95000, status: 'partial', dueDate: '2024-10-31' },
  { id: '3', invoiceNumber: 'INV/2024/00003', student: 'Chukwuemeka Obi', class: 'SS 3A', totalAmount: 210000, balance: 210000, status: 'overdue', dueDate: '2024-10-15' },
  { id: '4', invoiceNumber: 'INV/2024/00004', student: 'Aminat Bello', class: 'JSS 2A', totalAmount: 145000, balance: 145000, status: 'pending', dueDate: '2024-11-30' },
  { id: '5', invoiceNumber: 'INV/2024/00005', student: 'David Eze', class: 'SS 1B', totalAmount: 195000, balance: 0, status: 'paid', dueDate: '2024-10-31' },
]

const MOCK_SUMMARY = {
  totalExpected: 182750000,
  totalCollected: 134200000,
  outstanding: 48550000,
  overdueCount: 87,
  todayCollection: 2450000,
  thisMonthCollection: 24800000,
}

function TabButton({ id, label, active, onClick }: { id: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      {label}
    </button>
  )
}

function MetricCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showRecordPayment, setShowRecordPayment] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ invoiceId: '', amount: '', method: 'cash' })

  const fmt = (n: number) =>
    n >= 1000000 ? `₦${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `₦${(n / 1000).toFixed(0)}K` : `₦${n}`

  const filteredInvoices = MOCK_INVOICES.filter((inv) => {
    const matchSearch = search === '' || inv.student.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNumber.includes(search)
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  const collectionRate = Math.round((MOCK_SUMMARY.totalCollected / MOCK_SUMMARY.totalExpected) * 100)

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-sm text-gray-500">Fee collection, invoices, payments & accounting</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
            <Plus size={16} />
            New Invoice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200 w-fit">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'invoices', label: 'Invoices' },
          { id: 'payments', label: 'Payments' },
          { id: 'fee-structures', label: 'Fee Setup' },
          { id: 'defaulters', label: 'Defaulters' },
          { id: 'accounting', label: 'Accounting' },
        ].map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            active={activeTab === tab.id as Tab}
            onClick={() => setActiveTab(tab.id as Tab)}
          />
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Expected" value={fmt(MOCK_SUMMARY.totalExpected)} sub="This term" icon={FileText} color="bg-blue-500" />
            <MetricCard label="Total Collected" value={fmt(MOCK_SUMMARY.totalCollected)} sub={`${collectionRate}% collection rate`} icon={CheckCircle} color="bg-emerald-500" />
            <MetricCard label="Outstanding" value={fmt(MOCK_SUMMARY.outstanding)} sub={`${MOCK_SUMMARY.overdueCount} overdue`} icon={AlertCircle} color="bg-red-500" />
            <MetricCard label="Today's Collection" value={fmt(MOCK_SUMMARY.todayCollection)} sub="2024-11-14" icon={TrendingUp} color="bg-violet-500" />
          </div>

          {/* Collection Progress */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Collection Progress</h3>
              <span className="text-lg font-bold text-blue-600">{collectionRate}%</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>₦0</span>
              <span>Target: {fmt(MOCK_SUMMARY.totalExpected)}</span>
            </div>
          </div>

          {/* Payment by Method */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Breakdown by Method</h3>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { method: 'Cash', amount: 45200000, count: 312, color: 'bg-emerald-100 text-emerald-700' },
                { method: 'Bank Transfer', amount: 62800000, count: 186, color: 'bg-blue-100 text-blue-700' },
                { method: 'Paystack', amount: 18400000, count: 134, color: 'bg-purple-100 text-purple-700' },
                { method: 'Flutterwave', amount: 6200000, count: 52, color: 'bg-amber-100 text-amber-700' },
                { method: 'POS/Card', amount: 1600000, count: 24, color: 'bg-rose-100 text-rose-700' },
              ].map((item) => (
                <div key={item.method} className={`p-4 rounded-xl ${item.color}`}>
                  <p className="font-semibold text-sm">{fmt(item.amount)}</p>
                  <p className="text-xs mt-1">{item.method}</p>
                  <p className="text-xs opacity-75">{item.count} payments</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student or invoice..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Invoice #', 'Student', 'Class', 'Amount', 'Balance', 'Due Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-blue-600">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{inv.student}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{inv.class}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">₦{inv.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-medium">
                    <span className={inv.balance > 0 ? 'text-red-600' : 'text-emerald-600'}>
                      ₦{inv.balance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(inv.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {inv.balance > 0 && (
                      <button
                        onClick={() => { setPaymentForm({ invoiceId: inv.id, amount: inv.balance.toString(), method: 'cash' }); setShowRecordPayment(true) }}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Record Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Defaulters Tab */}
      {activeTab === 'defaulters' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">
              <strong>{MOCK_SUMMARY.overdueCount} students</strong> have overdue balances totaling{' '}
              <strong>{fmt(MOCK_SUMMARY.outstanding)}</strong>. Consider sending automated reminders.
            </p>
            <button className="ml-auto flex-shrink-0 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
              Send Reminders
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Student', 'Class', 'Parent Phone', 'Invoice', 'Amount Due', 'Days Overdue', 'Action'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { student: 'Chukwuemeka Obi', class: 'SS 3A', phone: '08031234567', invoice: 'INV/2024/00003', due: 210000, days: 30 },
                  { student: 'Kemi Adebayo', class: 'JSS 3B', phone: '08055678901', invoice: 'INV/2024/00009', due: 145000, days: 25 },
                  { student: 'Musa Garba', class: 'SS 1A', phone: '08098765432', invoice: 'INV/2024/00015', due: 195000, days: 14 },
                ].map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.student}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{d.class}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{d.phone}</td>
                    <td className="px-4 py-3 text-sm font-mono text-blue-600">{d.invoice}</td>
                    <td className="px-4 py-3 text-sm font-medium text-red-600">₦{d.due.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.days > 20 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {d.days} days
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-blue-600 hover:underline">Call Parent</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference (optional)</label>
                <input
                  type="text"
                  placeholder="Bank reference number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRecordPayment(false)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
