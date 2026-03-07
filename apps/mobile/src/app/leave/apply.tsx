import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as DocumentPicker from 'expo-document-picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { apiClient } from '../../../services/api'

const LEAVE_TYPES = [
  { value: 'ANNUAL', label: 'Annual Leave', icon: 'sunny-outline', days: 21 },
  { value: 'SICK', label: 'Sick Leave', icon: 'medical-outline', days: 10 },
  { value: 'EMERGENCY_SICK', label: 'Emergency Sick', icon: 'medkit-outline', days: 2 },
  { value: 'CASUAL', label: 'Casual Leave', icon: 'cafe-outline', days: 2 },
  { value: 'BEREAVEMENT', label: 'Bereavement Leave', icon: 'flower-outline', days: 5 },
  { value: 'STUDY', label: 'Study Leave', icon: 'book-outline', days: 10 },
  { value: 'MATERNITY', label: 'Maternity Leave', icon: 'heart-outline', days: 90 },
  { value: 'PATERNITY', label: 'Paternity Leave', icon: 'people-outline', days: 10 },
  { value: 'WEDDING', label: 'Wedding Leave', icon: 'rose-outline', days: 5 },
  { value: 'RELIGIOUS', label: 'Religious Leave', icon: 'star-outline', days: 0 },
  { value: 'HALF_DAY', label: 'Half Day', icon: 'time-outline', days: 0.5 },
  { value: 'UNPAID', label: 'Unpaid Leave', icon: 'wallet-outline', days: 0 },
]

export default function ApplyLeaveScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [leaveType, setLeaveType] = useState('')
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [reason, setReason] = useState('')
  const [handoverNotes, setHandoverNotes] = useState('')
  const [halfDayPart, setHalfDayPart] = useState<'MORNING' | 'AFTERNOON' | null>(null)
  const [document, setDocument] = useState<any>(null)
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [step, setStep] = useState(1) // 1: type, 2: dates, 3: details

  const applyMutation = useMutation({
    mutationFn: async (data: FormData) => apiClient.postForm('/leave/apply', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] })
      Alert.alert('Success', 'Leave request submitted successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ])
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit leave request')
    },
  })

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
    })
    if (!result.canceled && result.assets[0]) {
      setDocument(result.assets[0])
    }
  }

  const calculateDuration = () => {
    if (leaveType === 'HALF_DAY') return 0.5

    let count = 0
    const current = new Date(startDate)
    while (current <= endDate) {
      const day = current.getDay()
      if (day !== 0 && day !== 6) count++
      current.setDate(current.getDate() + 1)
    }
    return count
  }

  const handleSubmit = () => {
    if (!leaveType || !reason) {
      Alert.alert('Validation', 'Please fill in all required fields')
      return
    }

    const formData = new FormData()
    formData.append('leaveType', leaveType)
    formData.append('startDate', startDate.toISOString())
    formData.append('endDate', endDate.toISOString())
    formData.append('reason', reason)
    if (handoverNotes) formData.append('handoverNotes', handoverNotes)
    if (halfDayPart) formData.append('halfDayPart', halfDayPart)
    if (document) {
      formData.append('document', {
        uri: document.uri,
        name: document.name,
        type: document.mimeType || 'application/octet-stream',
      } as any)
    }

    applyMutation.mutate(formData)
  }

  const selectedType = LEAVE_TYPES.find((t) => t.value === leaveType)
  const duration = calculateDuration()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply for Leave</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.steps}>
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <View style={[styles.stepDot, step >= s && styles.stepDotActive]}>
              <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>{s}</Text>
            </View>
            {s < 3 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Select Leave Type */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Select Leave Type</Text>
            <View style={styles.typeGrid}>
              {LEAVE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.typeCard, leaveType === type.value && styles.typeCardSelected]}
                  onPress={() => setLeaveType(type.value)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={leaveType === type.value ? '#1565C0' : '#666'}
                  />
                  <Text style={[styles.typeLabel, leaveType === type.value && styles.typeLabelSelected]}>
                    {type.label}
                  </Text>
                  {type.days > 0 && (
                    <Text style={styles.typeDays}>{type.days} days</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.nextBtn, !leaveType && styles.nextBtnDisabled]}
              onPress={() => leaveType && setStep(2)}
            >
              <Text style={styles.nextBtnText}>Next: Select Dates</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Select Dates */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Select Dates</Text>

            {leaveType === 'HALF_DAY' ? (
              <View style={styles.halfDaySection}>
                <Text style={styles.label}>Which half?</Text>
                {(['MORNING', 'AFTERNOON'] as const).map((part) => (
                  <TouchableOpacity
                    key={part}
                    style={[styles.halfDayBtn, halfDayPart === part && styles.halfDayBtnSelected]}
                    onPress={() => setHalfDayPart(part)}
                  >
                    <Ionicons
                      name={part === 'MORNING' ? 'sunny' : 'moon'}
                      size={20}
                      color={halfDayPart === part ? '#1565C0' : '#666'}
                    />
                    <Text style={[styles.halfDayText, halfDayPart === part && styles.halfDayTextSelected]}>
                      {part}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartPicker(true)}>
              <Text style={styles.dateInputText}>{startDate.toLocaleDateString()}</Text>
              <Ionicons name="calendar-outline" size={18} color="#666" />
            </TouchableOpacity>

            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                minimumDate={new Date()}
                onChange={(_, date) => {
                  setShowStartPicker(false)
                  if (date) setStartDate(date)
                }}
              />
            )}

            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndPicker(true)}>
              <Text style={styles.dateInputText}>{endDate.toLocaleDateString()}</Text>
              <Ionicons name="calendar-outline" size={18} color="#666" />
            </TouchableOpacity>

            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                minimumDate={startDate}
                onChange={(_, date) => {
                  setShowEndPicker(false)
                  if (date) setEndDate(date)
                }}
              />
            )}

            <View style={styles.durationBox}>
              <Text style={styles.durationLabel}>Duration:</Text>
              <Text style={styles.durationValue}>{duration} working day(s)</Text>
            </View>

            <View style={styles.navRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Ionicons name="arrow-back" size={18} color="#1565C0" />
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(3)}>
                <Text style={styles.nextBtnText}>Next: Details</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Leave Details</Text>

            {/* Summary card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {selectedType?.label} — {duration} day(s)
              </Text>
              <Text style={styles.summaryDates}>
                {startDate.toLocaleDateString()} → {endDate.toLocaleDateString()}
              </Text>
            </View>

            <Text style={styles.label}>Reason *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide reason for leave..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Handover Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Who will cover your duties? Any important notes..."
              value={handoverNotes}
              onChangeText={setHandoverNotes}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Supporting Document</Text>
            <TouchableOpacity style={styles.documentBtn} onPress={pickDocument}>
              <Ionicons name="attach-outline" size={18} color="#1565C0" />
              <Text style={styles.documentBtnText}>
                {document ? document.name : 'Upload document (PDF/Image)'}
              </Text>
            </TouchableOpacity>

            {['SICK', 'EMERGENCY_SICK', 'HOSPITALIZATION', 'MATERNITY', 'BEREAVEMENT'].includes(leaveType) && (
              <View style={styles.docNote}>
                <Ionicons name="information-circle-outline" size={14} color="#1976D2" />
                <Text style={styles.docNoteText}>Document required after 2 days for {selectedType?.label}</Text>
              </View>
            )}

            <View style={styles.navRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
                <Ionicons name="arrow-back" size={18} color="#1565C0" />
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, applyMutation.isPending && styles.submitBtnLoading]}
                onPress={handleSubmit}
                disabled={applyMutation.isPending}
              >
                <Text style={styles.submitBtnText}>
                  {applyMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: { backgroundColor: '#1565C0' },
  stepNum: { fontSize: 14, fontWeight: '700', color: '#999' },
  stepNumActive: { color: '#fff' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E0E0E0', marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#1565C0' },
  content: { flex: 1, padding: 20 },
  stepTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 20 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  typeCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  typeCardSelected: { borderColor: '#1565C0', backgroundColor: '#E3F2FD' },
  typeLabel: { fontSize: 12, color: '#666', marginTop: 6, textAlign: 'center', fontWeight: '500' },
  typeLabelSelected: { color: '#1565C0', fontWeight: '700' },
  typeDays: { fontSize: 11, color: '#aaa', marginTop: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  dateInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: { fontSize: 15, color: '#333' },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  durationLabel: { fontSize: 14, color: '#2E7D32', fontWeight: '600' },
  durationValue: { fontSize: 14, color: '#2E7D32', fontWeight: '800' },
  halfDaySection: { marginBottom: 8 },
  halfDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  halfDayBtnSelected: { borderColor: '#1565C0', backgroundColor: '#E3F2FD' },
  halfDayText: { fontSize: 15, color: '#666', fontWeight: '600' },
  halfDayTextSelected: { color: '#1565C0' },
  documentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#1565C0',
  },
  documentBtnText: { color: '#1565C0', fontWeight: '500', flex: 1 },
  docNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 6,
  },
  docNoteText: { fontSize: 12, color: '#1976D2' },
  summaryCard: {
    backgroundColor: '#1565C0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  summaryTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  summaryDates: { color: '#BBDEFB', marginTop: 4, fontSize: 14 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 40 },
  backBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#1565C0',
    borderRadius: 10,
    paddingVertical: 14,
  },
  backBtnText: { color: '#1565C0', fontWeight: '600' },
  nextBtn: {
    flex: 2,
    backgroundColor: '#1565C0',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnDisabled: { backgroundColor: '#BDBDBD' },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  submitBtn: {
    flex: 2,
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnLoading: { backgroundColor: '#81C784' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
