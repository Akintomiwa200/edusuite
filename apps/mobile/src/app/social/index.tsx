import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Image, FlatList, RefreshControl, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'

interface Post {
  id: string
  author: { name: string; initials: string; role: string; level: number; color: string }
  content: string
  type: 'text' | 'achievement' | 'announcement'
  likes: number
  comments: number
  isLiked: boolean
  timestamp: string
  achievement?: { title: string; emoji: string; points: number }
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: { name: 'Adewale Johnson', initials: 'AJ', role: 'student', level: 24, color: '#3B82F6' },
    content: 'Just aced my Mathematics exam! 🎉 All those study sessions finally paid off!',
    type: 'text',
    likes: 47,
    comments: 12,
    isLiked: false,
    timestamp: '2h ago',
  },
  {
    id: '2',
    author: { name: 'Mrs. Fatima Okafor', initials: 'FO', role: 'teacher', level: 45, color: '#10B981' },
    content: 'Reminder: Chemistry practical is scheduled for Friday. Please bring lab coats and safety goggles.',
    type: 'announcement',
    likes: 18,
    comments: 7,
    isLiked: true,
    timestamp: '4h ago',
  },
  {
    id: '3',
    author: { name: 'Chioma Eze', initials: 'CE', role: 'student', level: 31, color: '#8B5CF6' },
    content: "Look who just unlocked the 'Science Star' badge! 🌟",
    type: 'achievement',
    likes: 89,
    comments: 23,
    isLiked: false,
    timestamp: '6h ago',
    achievement: { title: 'Science Star', emoji: '🔬', points: 500 },
  },
]

const ROLE_COLORS: Record<string, string> = {
  student: '#3B82F6',
  teacher: '#10B981',
  admin: '#8B5CF6',
}

export default function SocialFeedScreen() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [newPost, setNewPost] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'friends'>('feed')

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ))
  }

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handlePost = () => {
    if (!newPost.trim()) return
    const post: Post = {
      id: Date.now().toString(),
      author: { name: 'You', initials: 'ME', role: 'student', level: 24, color: '#3B82F6' },
      content: newPost,
      type: 'text',
      likes: 0,
      comments: 0,
      isLiked: false,
      timestamp: 'Just now',
    }
    setPosts(prev => [post, ...prev])
    setNewPost('')
  }

  const renderPost = ({ item: post }: { item: Post }) => (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: post.author.color }]}>
          <Text style={styles.avatarText}>{post.author.initials}</Text>
        </View>
        <View style={styles.authorInfo}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{post.author.name}</Text>
            <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[post.author.role] + '20' }]}>
              <Text style={[styles.roleText, { color: ROLE_COLORS[post.author.role] }]}>{post.author.role}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.timestamp}>{post.timestamp}</Text>
            <Text style={styles.levelText}>⚡ Lv.{post.author.level}</Text>
          </View>
        </View>
      </View>

      {/* Achievement Banner */}
      {post.type === 'achievement' && post.achievement && (
        <View style={styles.achievementBanner}>
          <Text style={styles.achievementEmoji}>{post.achievement.emoji}</Text>
          <View>
            <Text style={styles.achievementTitle}>🏆 Achievement Unlocked!</Text>
            <Text style={styles.achievementName}>{post.achievement.title}</Text>
            <Text style={styles.achievementPoints}>+{post.achievement.points} XP</Text>
          </View>
        </View>
      )}

      {/* Announcement indicator */}
      {post.type === 'announcement' && (
        <View style={styles.announcementTag}>
          <Text style={styles.announcementText}>📢 Announcement</Text>
        </View>
      )}

      {/* Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, post.isLiked && styles.likedButton]}
          onPress={() => handleLike(post.id)}
        >
          <Text style={[styles.actionIcon, post.isLiked && styles.likedIcon]}>❤️</Text>
          <Text style={[styles.actionCount, post.isLiked && styles.likedCount]}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>↗️</Text>
          <Text style={styles.actionCount}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>⚑</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social Hub</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notifButton}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>3</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton}>
            <Text>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['feed', 'groups', 'friends'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'feed' && (
        <>
          {/* Compose */}
          <View style={styles.composeCard}>
            <View style={[styles.avatarSmall, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.avatarSmallText}>ME</Text>
            </View>
            <View style={styles.composeInput}>
              <TextInput
                placeholder="Share something..."
                value={newPost}
                onChangeText={setNewPost}
                style={styles.textInput}
                multiline
                placeholderTextColor="#9CA3AF"
              />
              {newPost.length > 0 && (
                <TouchableOpacity style={styles.postButton} onPress={handlePost}>
                  <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Feed */}
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.feedList}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {activeTab === 'groups' && (
        <ScrollView style={styles.listContainer}>
          {[
            { name: 'SS 2A Class Group', emoji: '📚', members: 42, joined: true },
            { name: 'Science Club', emoji: '🔬', members: 78, joined: true },
            { name: 'WAEC Study Group', emoji: '📝', members: 35, joined: false },
            { name: 'Drama Club', emoji: '🎭', members: 29, joined: false },
          ].map((group, i) => (
            <View key={i} style={styles.groupCard}>
              <View style={styles.groupEmoji}>
                <Text style={styles.groupEmojiText}>{group.emoji}</Text>
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupMembers}>{group.members} members</Text>
              </View>
              <TouchableOpacity style={[styles.joinButton, group.joined && styles.joinedButton]}>
                <Text style={[styles.joinButtonText, group.joined && styles.joinedButtonText]}>
                  {group.joined ? 'Joined ✓' : 'Join'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {activeTab === 'friends' && (
        <ScrollView style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Friend Requests</Text>
          {[
            { name: 'Tunde Bakare', initials: 'TB', mutual: 12, color: '#6366F1' },
            { name: 'Ngozi Williams', initials: 'NW', mutual: 7, color: '#EC4899' },
          ].map((req, i) => (
            <View key={i} style={styles.friendCard}>
              <View style={[styles.avatar, { backgroundColor: req.color }]}>
                <Text style={styles.avatarText}>{req.initials}</Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{req.name}</Text>
                <Text style={styles.mutualText}>{req.mutual} mutual friends</Text>
              </View>
              <View style={styles.friendActions}>
                <TouchableOpacity style={styles.acceptBtn}>
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineBtn}>
                  <Text style={styles.declineBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 56, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  headerRight: { flexDirection: 'row', gap: 8 },
  notifButton: { position: 'relative', padding: 8 },
  notifIcon: { fontSize: 20 },
  notifBadge: {
    position: 'absolute', top: 4, right: 4, width: 16, height: 16,
    backgroundColor: '#EF4444', borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  searchButton: { padding: 8 },
  tabRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingBottom: 0,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  tab: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#2563EB' },
  tabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  activeTabText: { color: '#2563EB', fontWeight: '600' },
  composeCard: {
    flexDirection: 'row', gap: 12, margin: 12,
    backgroundColor: '#fff', borderRadius: 16,
    padding: 12, borderWidth: 1, borderColor: '#E5E7EB',
  },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarSmallText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  composeInput: { flex: 1 },
  textInput: { fontSize: 14, color: '#374151', minHeight: 40, lineHeight: 20 },
  postButton: {
    alignSelf: 'flex-end', marginTop: 8, backgroundColor: '#2563EB',
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8,
  },
  postButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  feedList: { paddingHorizontal: 12, paddingBottom: 24 },
  postCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  postHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  authorInfo: { flex: 1 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authorName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 },
  roleText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  timestamp: { fontSize: 12, color: '#9CA3AF' },
  levelText: { fontSize: 12, color: '#D97706', fontWeight: '500' },
  achievementBanner: {
    flexDirection: 'row', gap: 12, backgroundColor: '#FFFBEB',
    borderWidth: 1, borderColor: '#FDE68A', borderRadius: 12,
    padding: 12, marginBottom: 12, alignItems: 'center',
  },
  achievementEmoji: { fontSize: 36 },
  achievementTitle: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  achievementName: { fontSize: 13, color: '#B45309', fontWeight: '600' },
  achievementPoints: { fontSize: 11, color: '#D97706', marginTop: 2 },
  announcementTag: { marginBottom: 8 },
  announcementText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  postContent: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 12 },
  actionsRow: {
    flexDirection: 'row', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 4,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
  likedButton: { backgroundColor: '#FEF2F2' },
  actionIcon: { fontSize: 14 },
  likedIcon: { color: '#EF4444' },
  actionCount: { fontSize: 13, color: '#6B7280' },
  likedCount: { color: '#EF4444', fontWeight: '600' },
  listContainer: { flex: 1, padding: 12 },
  groupCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB',
  },
  groupEmoji: {
    width: 44, height: 44, backgroundColor: '#EFF6FF',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  groupEmojiText: { fontSize: 22 },
  groupInfo: { flex: 1 },
  groupName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  groupMembers: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  joinButton: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: '#2563EB', borderRadius: 8,
  },
  joinedButton: { backgroundColor: '#F3F4F6' },
  joinButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  joinedButtonText: { color: '#374151' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
  friendCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB',
  },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  mutualText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  friendActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: { backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  acceptBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  declineBtn: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  declineBtnText: { color: '#6B7280', fontSize: 12, fontWeight: '600' },
})
