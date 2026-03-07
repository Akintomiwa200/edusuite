import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import { apiClient } from '../../../services/api'

const PRIORITY_CONFIG = {
  CRITICAL: { color: '#D32F2F', icon: 'alert-circle', label: 'Critical (Safety)' },
  HIGH: { color: '#F57C00', icon: 'warning', label: 'High (Disrupts Learning)' },
  MEDIUM: { color: '#1976D2', icon: 'information-circle', label: 'Medium (3 Days)' },
  LOW: { color: '#388E3C', icon: 'checkmark-circle', label: 'Low (1 Week)' },
}

const CATEGORIES = [
  { value: 'ELECTRICAL', icon: 'flash-outline' },
  { value: 'PLUMBING', icon: 'water-outline' },
  { value: 'CARPENTRY', icon: 'hammer-outline' },
  { value: 'HVAC', icon: 'thermometer-outline' },
  { value: 'GENERATOR', icon: 'battery-charging-outline' },
  { value: 'PAINTING', icon: 'color-palette-outline' },
  { value: 'IT', icon: 'laptop-outline' },
  { value: 'FURNITURE', icon: 'bed-outline' },
  { value: 'GENERAL', icon: 'construct-outline' },
]

const STATUS_CONFIG = {
  OPEN: { color: '#F57C00', label: 'Open' },
  ASSIGNED: { color: '#1976D2', label: 'Assigned' },
  IN_PROGRESS: { color: '#7B1FA2', label: 'In Progress' },
  ON_HOLD: { color: '#795548', label: 'On Hold' },
  COMPLETED: { color: '#388E3C', label: 'Completed' },
  REJECTED: { color: '#D32F2F', label: 'Rejected' },
}

export default function MaintenanceScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  const { data: tickets } = useQuery({
    queryKey: ['maintenance', 'my-requests'],
    queryFn: () => apiClient.get('/maintenance?type=mine'),
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => apiClient.postForm('/maintenance', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      setShowForm(false)
      setTitle('')
      setDescription('')
      setCategory('')
      setPriority('')
      setPhotos([])
      Alert.alert('Submitted', 'Maintenance request submitted successfully')
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit request')
    },
  })

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
    })
    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 4))
    }
  }

  const handleSubmit = () => {
    if (!title || !description || !category || !priority) {
      Alert.alert('Validation', 'Please fill in all required fields')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('category', category)
    formData.append('priority', priority)
    photos.forEach((uri, i) => {
      formData.append('photos', { uri, name: `photo_${i}.jpg`, type: 'image/jpeg' } as any)
    })

    createMutation.mutate(formData)
  }

  const ticketList: any[] = tickets?.data || []

  if (showForm) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowForm(false)}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Issue</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Issue Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Issue title *"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the issue in detail... *"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[styles.categoryBtn, category === cat.value && styles.categoryBtnSelected]}
                onPress={() => setCategory(cat.value)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={20}
                  color={category === cat.value ? '#1565C0' : '#666'}
                />
                <Text style={[styles.categoryLabel, category === cat.value && styles.categoryLabelSelected]}>
                  {cat.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Priority *</Text>
          {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              style={[styles.priorityBtn, priority === key && { borderColor: config.color, backgroundColor: config.color + '15' }]}
              onPress={() => setPriority(key)}
            >
              <Ionicons name={config.icon as any} size={18} color={priority === key ? config.color : '#999'} />
              <Text style={[styles.priorityLabel, priority === key && { color: config.color }]}>
                {config.label}
              </Text>
              {priority === key && <Ionicons name="checkmark-circle" size={18} color={config.color} />}
            </TouchableOpacity>
          ))}

          <Text style={styles.label}>Photos (optional, max 4)</Text>
          <View style={styles.photosRow}>
            {photos.map((uri, i) => (
              <View key={i} style={styles.photoThumb}>
                <Image source={{ uri }} style={styles.photoImg} />
                <TouchableOpacity
                  style={styles.photoRemove}
                  onPress={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <Ionicons name="close-circle" size={18} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 4 && (
              <TouchableOpacity style={styles.addPhotoBtn} onPress={pickPhoto}>
                <Ionicons name="camera-outline" size={24} color="#666" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, createMutation.isPending && styles.submitBtnLoading]}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            <Text style={styles.submitBtnText}>
              {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maintenance Requests</Text>
        <TouchableOpacity onPress={() => setShowForm(true)}>
          <Ionicons name="add-circle-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={ticketList}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="construct-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No maintenance requests</Text>
            <TouchableOpacity style={styles.reportBtn} onPress={() => setShowForm(true)}>
              <Text style={styles.reportBtnText}>Report an Issue</Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item }) => {
          const statusConfig = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || { color: '#666', label: item.status }
          const priorityConfig = PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG]

          return (
            <TouchableOpacity style={styles.ticketCard}>
              <View style={styles.ticketTop}>
                <Text style={styles.ticketNumber}>{item.ticketNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
                  <Text style={styles.statusBadgeText}>{statusConfig.label}</Text>
                </View>
              </View>
              <Text style={styles.ticketTitle}>{item.title}</Text>
              <Text style={styles.ticketDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.ticketMeta}>
                <View style={[styles.priorityDot, { backgroundColor: priorityConfig?.color || '#666' }]} />
                <Text style={styles.ticketMetaText}>{item.priority}</Text>
                <Text style={styles.ticketMetaSep}>•</Text>
                <Text style={styles.ticketMetaText}>{item.category}</Text>
                <Text style={styles.ticketMetaSep}>•</Text>
                <Text style={styles.ticketMetaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              {item.slaBreach && (
                <View style={styles.slaBreach}>
                  <Ionicons name="alert-circle" size={12} color="#D32F2F" />
                  <Text style={styles.slaBreachText}>SLA Breached</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#37474F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 14,
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryBtnSelected: { borderColor: '#1565C0', backgroundColor: '#E3F2FD' },
  categoryLabel: { fontSize: 12, color: '#666', fontWeight: '500' },
  categoryLabelSelected: { color: '#1565C0', fontWeight: '700' },
  priorityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  priorityLabel: { flex: 1, fontSize: 14, color: '#666' },
  photosRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  photoThumb: { width: 80, height: 80, borderRadius: 8, overflow: 'hidden' },
  photoImg: { width: '100%', height: '100%' },
  photoRemove: { position: 'absolute', top: 2, right: 2 },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  addPhotoText: { fontSize: 10, color: '#666', marginTop: 4 },
  submitBtn: {
    backgroundColor: '#37474F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnLoading: { backgroundColor: '#90A4AE' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  ticketNumber: { fontSize: 12, color: '#999', fontFamily: 'monospace' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  ticketTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  ticketDesc: { fontSize: 13, color: '#888', lineHeight: 18, marginBottom: 10 },
  ticketMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  ticketMetaText: { fontSize: 12, color: '#888' },
  ticketMetaSep: { color: '#ccc', fontSize: 12 },
  slaBreach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: '#FFEBEE',
    padding: 6,
    borderRadius: 6,
  },
  slaBreachText: { fontSize: 11, color: '#D32F2F', fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#aaa', marginTop: 12, marginBottom: 24 },
  reportBtn: { backgroundColor: '#37474F', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  reportBtnText: { color: '#fff', fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#37474F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
})
