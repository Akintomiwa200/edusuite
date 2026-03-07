import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../services/api'

const LEAVE_COLORS: Record<string, string> = {
  ANNUAL: '#4CAF50',
  SICK: '#F44336',
  MATERNITY: '#E91E63',
  PATERNITY: '#2196F3',
  CASUAL: '#FF9800',
  STUDY: '#9C27B0',
  BEREAVEMENT: '#607D8B',
  EMERGENCY_SICK: '#FF5722',
  UNPAID: '#795548',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#FF9800',
  PENDING_HR: '#FF9800',
  PENDING_BRANCH_ADMIN: '#FF9800',
  PENDING_SUPERVISOR: '#FF9800',
  APPROVED: '#4CAF50',
  REJECTED: '#F44336',
  CANCELLED: '#9E9E9E',
  RECALLED: '#FF5722',
  TAKEN: '#2196F3',
}

export default function LeaveScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'requests' | 'balances'>('requests')
  const [refreshing, setRefreshing] = useState(false)

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['leave', 'my-requests'],
    queryFn: () => apiClient.get('/leave/my-requests'),
  })

  const { data: balances } = useQuery({
    queryKey: ['leave', 'balances'],
    queryFn: () => apiClient.get('/leave/balance'),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/leave/${id}/cancel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave'] }),
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['leave'] })
    setRefreshing(false)
  }

  const handleCancel = (id: string) => {
    Alert.alert('Cancel Leave', 'Are you sure you want to cancel this leave request?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: () => cancelMutation.mutate(id) },
    ])
  }

  const leaveItems: any[] = requests?.data || []
  const balanceItems: any[] = balances?.data || []

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Management</Text>
        <TouchableOpacity onPress={() => router.push('/leave/apply')}>
          <Ionicons name="add-circle-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            My Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'balances' && styles.activeTab]}
          onPress={() => setActiveTab('balances')}
        >
          <Text style={[styles.tabText, activeTab === 'balances' && styles.activeTabText]}>
            Balances
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'requests' ? (
          <>
            {leaveItems.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="calendar-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No leave requests yet</Text>
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => router.push('/leave/apply')}
                >
                  <Text style={styles.applyBtnText}>Apply for Leave</Text>
                </TouchableOpacity>
              </View>
            ) : (
              leaveItems.map((req) => (
                <View key={req._id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={[styles.typeTag, { backgroundColor: LEAVE_COLORS[req.leaveType] || '#607D8B' }]}>
                      <Text style={styles.typeTagText}>{req.leaveType.replace(/_/g, ' ')}</Text>
                    </View>
                    <View style={[styles.statusTag, { backgroundColor: STATUS_COLORS[req.status] || '#607D8B' }]}>
                      <Text style={styles.statusTagText}>{req.status.replace(/_/g, ' ')}</Text>
                    </View>
                  </View>

                  <Text style={styles.cardDates}>
                    {new Date(req.startDate).toLocaleDateString()} –{' '}
                    {new Date(req.endDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.cardDuration}>{req.durationDays} working day(s)</Text>
                  <Text style={styles.cardReason} numberOfLines={2}>{req.reason}</Text>

                  {req.hasConflict && (
                    <View style={styles.conflictBanner}>
                      <Ionicons name="warning-outline" size={14} color="#ff5722" />
                      <Text style={styles.conflictText}>Staffing conflict detected</Text>
                    </View>
                  )}

                  {['PENDING', 'PENDING_SUPERVISOR', 'PENDING_HR', 'PENDING_BRANCH_ADMIN'].includes(req.status) && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(req._id)}>
                      <Text style={styles.cancelBtnText}>Cancel Request</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </>
        ) : (
          <>
            <View style={styles.balanceSummary}>
              <Ionicons name="information-circle-outline" size={16} color="#666" />
              <Text style={styles.balanceSummaryText}>Leave balances for {new Date().getFullYear()}</Text>
            </View>
            {balanceItems.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No leave balances found</Text>
              </View>
            ) : (
              balanceItems.map((bal, i) => (
                <View key={i} style={styles.balanceCard}>
                  <View style={styles.balanceLeft}>
                    <Text style={styles.balanceType}>{bal.leaveType.replace(/_/g, ' ')}</Text>
                    <Text style={styles.balanceUsed}>Used: {bal.usedDays} / {bal.totalDays + bal.carriedOverDays}</Text>
                    {bal.pendingDays > 0 && (
                      <Text style={styles.balancePending}>Pending: {bal.pendingDays} days</Text>
                    )}
                  </View>
                  <View style={styles.balanceRight}>
                    <Text style={styles.balanceAvailable}>{bal.availableDays}</Text>
                    <Text style={styles.balanceAvailableLabel}>available</Text>
                  </View>
                  {/* Progress bar */}
                  <View style={styles.progressContainer}>
                    <View style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(100, (bal.usedDays / (bal.totalDays || 1)) * 100)}%`,
                        backgroundColor: LEAVE_COLORS[bal.leaveType] || '#607D8B',
                      },
                    ]} />
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/leave/apply')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#1565C0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#1565C0' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#1565C0', fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  typeTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  typeTagText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusTagText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardDates: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 2 },
  cardDuration: { fontSize: 13, color: '#666', marginBottom: 6 },
  cardReason: { fontSize: 13, color: '#888', lineHeight: 18 },
  conflictBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBE9E7',
    borderRadius: 6,
    padding: 6,
    marginTop: 8,
    gap: 4,
  },
  conflictText: { fontSize: 11, color: '#ff5722' },
  cancelBtn: {
    marginTop: 12,
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#F44336', fontWeight: '600', fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#aaa', marginTop: 12, marginBottom: 24 },
  applyBtn: { backgroundColor: '#1565C0', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  applyBtnText: { color: '#fff', fontWeight: '700' },
  balanceSummary: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  balanceSummaryText: { fontSize: 13, color: '#666' },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
  },
  balanceLeft: { flex: 1 },
  balanceRight: { position: 'absolute', right: 16, top: 16, alignItems: 'center' },
  balanceType: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 2 },
  balanceUsed: { fontSize: 12, color: '#666' },
  balancePending: { fontSize: 12, color: '#FF9800', marginTop: 2 },
  balanceAvailable: { fontSize: 28, fontWeight: '800', color: '#1565C0' },
  balanceAvailableLabel: { fontSize: 11, color: '#999' },
  progressContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', borderRadius: 2 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
})
