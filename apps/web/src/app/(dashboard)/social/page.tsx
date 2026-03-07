'use client'

import { useState } from 'react'
import {
  Heart, MessageCircle, Share2, MoreHorizontal, Send, Image, Smile,
  Users, Globe, Lock, BookOpen, Trophy, Bell, Search, UserPlus,
  ThumbsUp, Star, Zap, Shield, TrendingUp, Hash, UserCheck,
  PlusCircle, ChevronRight, Eye, Flag, Trash2, Award
} from 'lucide-react'

type PostType = 'text' | 'image' | 'achievement' | 'announcement'
type PostVisibility = 'public' | 'friends' | 'class'
type Tab = 'feed' | 'groups' | 'friends' | 'messages'

interface Post {
  id: string
  author: { name: string; avatar: string; role: string; level: number }
  content: string
  type: PostType
  visibility: PostVisibility
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  timestamp: string
  tags?: string[]
  media?: string[]
  achievement?: { title: string; badge: string; points: number }
  isFlagged?: boolean
}

interface Group {
  id: string
  name: string
  type: string
  members: number
  isJoined: boolean
  description: string
  cover: string
}

interface FriendSuggestion {
  id: string
  name: string
  avatar: string
  mutualFriends: number
  class: string
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: { name: 'Adewale Johnson', avatar: 'AJ', role: 'student', level: 24 },
    content: 'Just aced my Mathematics exam! 🎉 All those late-night study sessions finally paid off. Shoutout to my study group for helping me prep. #MathIsLife #SS2',
    type: 'text',
    visibility: 'public',
    likes: 47,
    comments: 12,
    shares: 3,
    isLiked: false,
    timestamp: '2 hours ago',
    tags: ['MathIsLife', 'SS2'],
  },
  {
    id: '2',
    author: { name: 'Mrs. Fatima Okafor', avatar: 'FO', role: 'teacher', level: 45 },
    content: 'Reminder: Chemistry practical is scheduled for this Friday. Please bring your lab coats and safety goggles. Review chapters 8 and 9 before coming in. 📚🔬',
    type: 'announcement',
    visibility: 'class',
    likes: 18,
    comments: 7,
    shares: 0,
    isLiked: true,
    timestamp: '4 hours ago',
  },
  {
    id: '3',
    author: { name: 'Chioma Eze', avatar: 'CE', role: 'student', level: 31 },
    content: 'Look who just unlocked the "Science Star" badge! I\'ve been working towards this all term. 🌟',
    type: 'achievement',
    visibility: 'public',
    likes: 89,
    comments: 23,
    shares: 5,
    isLiked: false,
    timestamp: '6 hours ago',
    achievement: { title: 'Science Star', badge: '🔬', points: 500 },
  },
  {
    id: '4',
    author: { name: 'Ibrahim Musa', avatar: 'IM', role: 'student', level: 18 },
    content: 'Anyone in SS3 want to form a study group for WAEC prep? I\'m thinking weekends at the library from 9am-1pm. Drop a comment if interested!',
    type: 'text',
    visibility: 'public',
    likes: 31,
    comments: 14,
    shares: 8,
    isLiked: false,
    timestamp: '1 day ago',
    tags: ['WAEC', 'StudyGroup', 'SS3'],
  },
  {
    id: '5',
    author: { name: 'Principal Adebayo', avatar: 'PA', role: 'admin', level: 99 },
    content: 'Congratulations to our Inter-House Sports Competition winners! 🏆 Blue House takes the trophy this year with 480 points! Great performance by all houses. Full results on the Sports page.',
    type: 'announcement',
    visibility: 'public',
    likes: 156,
    comments: 45,
    shares: 22,
    isLiked: true,
    timestamp: '2 days ago',
  },
]

const MOCK_GROUPS: Group[] = [
  { id: '1', name: 'SS 2A Class Group', type: 'class', members: 42, isJoined: true, description: 'Official group for SS 2A students', cover: '📚' },
  { id: '2', name: 'Science Club', type: 'club', members: 78, isJoined: true, description: 'Exploring the wonders of science together', cover: '🔬' },
  { id: '3', name: 'WAEC Study Group', type: 'study', members: 35, isJoined: false, description: 'Prep group for WAEC 2025 candidates', cover: '📝' },
  { id: '4', name: 'School Drama Club', type: 'club', members: 29, isJoined: false, description: 'Act, perform, and create magic on stage', cover: '🎭' },
  { id: '5', name: 'Mathematics Olympiad', type: 'study', members: 22, isJoined: false, description: 'Training for national math competitions', cover: '📐' },
]

const MOCK_SUGGESTIONS: FriendSuggestion[] = [
  { id: '1', name: 'Olumide Adeyemi', avatar: 'OA', mutualFriends: 8, class: 'SS 2B' },
  { id: '2', name: 'Blessing Nwosu', avatar: 'BN', mutualFriends: 5, class: 'SS 2A' },
  { id: '3', name: 'Kehinde Afolabi', avatar: 'KA', mutualFriends: 3, class: 'SS 2C' },
]

const ROLE_COLORS: Record<string, string> = {
  student: 'bg-blue-100 text-blue-700',
  teacher: 'bg-emerald-100 text-emerald-700',
  admin: 'bg-purple-100 text-purple-700',
}

const VISIBILITY_ICONS: Record<PostVisibility, { icon: typeof Globe; label: string }> = {
  public: { icon: Globe, label: 'School' },
  friends: { icon: Users, label: 'Friends' },
  class: { icon: BookOpen, label: 'Class' },
}

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS)
  const [newPostContent, setNewPostContent] = useState('')
  const [postVisibility, setPostVisibility] = useState<PostVisibility>('public')
  const [isPosting, setIsPosting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ))
  }

  const handlePost = () => {
    if (!newPostContent.trim()) return
    setIsPosting(true)
    setTimeout(() => {
      const newPost: Post = {
        id: Date.now().toString(),
        author: { name: 'You', avatar: 'ME', role: 'student', level: 24 },
        content: newPostContent,
        type: 'text',
        visibility: postVisibility,
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        timestamp: 'Just now',
      }
      setPosts(prev => [newPost, ...prev])
      setNewPostContent('')
      setIsPosting(false)
    }, 500)
  }

  const handleJoinGroup = (groupId: string) => {
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, isJoined: !g.isJoined, members: g.isJoined ? g.members - 1 : g.members + 1 } : g
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Social Hub</h1>
              <p className="text-sm text-gray-500">Connect with your school community</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts, people..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px">
            {(['feed', 'groups', 'friends', 'messages'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {tab === 'messages' && (
                  <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">5</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* FEED TAB */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-4">
              {/* Compose Post */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    ME
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Share something with your school community..."
                      value={newPostContent}
                      onChange={e => setNewPostContent(e.target.value)}
                      rows={3}
                      className="w-full text-sm resize-none border-0 outline-none text-gray-700 placeholder-gray-400"
                    />
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Image className="w-4 h-4 text-green-500" />
                          Photo
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Hash className="w-4 h-4 text-blue-500" />
                          Tag
                        </button>
                        {/* Visibility selector */}
                        <select
                          value={postVisibility}
                          onChange={e => setPostVisibility(e.target.value as PostVisibility)}
                          className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
                        >
                          <option value="public">🌐 School</option>
                          <option value="friends">👥 Friends</option>
                          <option value="class">📚 Class</option>
                        </select>
                      </div>
                      <button
                        onClick={handlePost}
                        disabled={!newPostContent.trim() || isPosting}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {isPosting ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts */}
              {posts.map(post => {
                const VisIcon = VISIBILITY_ICONS[post.visibility].icon
                return (
                  <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    {/* Post header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          post.author.role === 'teacher' ? 'bg-emerald-600' :
                          post.author.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                        }`}>
                          {post.author.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{post.author.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[post.author.role]}`}>
                              {post.author.role}
                            </span>
                            <span className="text-xs text-amber-600 font-medium flex items-center gap-0.5">
                              <Zap className="w-3 h-3" />
                              Lv.{post.author.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                            <span>{post.timestamp}</span>
                            <span>·</span>
                            <VisIcon className="w-3 h-3" />
                            <span>{VISIBILITY_ICONS[post.visibility].label}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Achievement badge */}
                    {post.type === 'achievement' && post.achievement && (
                      <div className="mb-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
                        <div className="text-3xl">{post.achievement.badge}</div>
                        <div>
                          <div className="text-sm font-semibold text-amber-800">🏆 Achievement Unlocked!</div>
                          <div className="text-sm text-amber-700">{post.achievement.title}</div>
                          <div className="text-xs text-amber-600 mt-0.5">+{post.achievement.points} XP earned</div>
                        </div>
                      </div>
                    )}

                    {/* Announcement badge */}
                    {post.type === 'announcement' && (
                      <div className="mb-2 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                        <Bell className="w-3.5 h-3.5" />
                        <span>Announcement</span>
                      </div>
                    )}

                    {/* Content */}
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.content}</p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.map(tag => (
                          <span key={tag} className="text-xs text-blue-600 hover:underline cursor-pointer">#{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          post.isLiked ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span>{post.shares}</span>
                      </button>
                      <div className="flex-1" />
                      <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-100 transition-colors">
                        <Flag className="w-3.5 h-3.5" />
                        Report
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* My Profile Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    ME
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Your Profile</div>
                    <div className="text-xs text-gray-500">SS 2A · Level 24</div>
                  </div>
                </div>
                {/* XP Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-medium text-amber-600 flex items-center gap-1"><Zap className="w-3 h-3" /> 2,480 XP</span>
                    <span>Lv.25 needs 2,800</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[{ label: 'Friends', value: 56 }, { label: 'Posts', value: 23 }, { label: 'Badges', value: 12 }].map(stat => (
                    <div key={stat.label} className="bg-gray-50 rounded-lg p-2">
                      <div className="text-base font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streak */}
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">🔥 14 Days</div>
                    <div className="text-sm opacity-90">Login Streak</div>
                  </div>
                  <div className="text-4xl opacity-20">🔥</div>
                </div>
              </div>

              {/* Friend Suggestions */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-500" />
                  People You May Know
                </h3>
                <div className="space-y-3">
                  {MOCK_SUGGESTIONS.map(suggestion => (
                    <div key={suggestion.id} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
                        {suggestion.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{suggestion.name}</div>
                        <div className="text-xs text-gray-500">{suggestion.mutualFriends} mutual · {suggestion.class}</div>
                      </div>
                      <button className="text-xs text-blue-600 font-medium hover:text-blue-700 whitespace-nowrap">
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* My Groups */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  My Groups
                </h3>
                <div className="space-y-2">
                  {MOCK_GROUPS.filter(g => g.isJoined).map(group => (
                    <div key={group.id} className="flex items-center gap-2.5 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <div className="text-xl">{group.cover}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{group.name}</div>
                        <div className="text-xs text-gray-500">{group.members} members</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard Preview */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Top Students This Week
                </h3>
                <div className="space-y-2">
                  {[
                    { rank: 1, name: 'Chioma Eze', xp: 890, badge: '🥇' },
                    { rank: 2, name: 'Adewale J.', xp: 720, badge: '🥈' },
                    { rank: 3, name: 'Ibrahim M.', xp: 650, badge: '🥉' },
                  ].map(entry => (
                    <div key={entry.rank} className="flex items-center gap-2.5">
                      <span className="text-base">{entry.badge}</span>
                      <span className="text-sm text-gray-700 flex-1">{entry.name}</span>
                      <span className="text-xs font-medium text-amber-600">{entry.xp} XP</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1">
                  View Full Leaderboard <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GROUPS TAB */}
        {activeTab === 'groups' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Groups & Circles</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                <PlusCircle className="w-4 h-4" />
                Create Group
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(group => (
                <div key={group.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-20 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-5xl">
                    {group.cover}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">{group.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{group.type}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{group.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {group.members} members
                      </span>
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          group.isJoined
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {group.isJoined ? 'Joined ✓' : 'Join'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FRIENDS TAB */}
        {activeTab === 'friends' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Friend Requests (3)</h2>
              <div className="space-y-3">
                {[
                  { id: '1', name: 'Tunde Bakare', avatar: 'TB', mutualFriends: 12, class: 'SS 2A' },
                  { id: '2', name: 'Ngozi Williams', avatar: 'NW', mutualFriends: 7, class: 'SS 2B' },
                  { id: '3', name: 'Seun Adeyemi', avatar: 'SA', mutualFriends: 4, class: 'SS 3A' },
                ].map(req => (
                  <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                      {req.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{req.name}</div>
                      <div className="text-xs text-gray-500">{req.mutualFriends} mutual friends · {req.class}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">Accept</button>
                      <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">People You May Know</h2>
              <div className="space-y-3">
                {[...MOCK_SUGGESTIONS, { id: '4', name: 'Amaka Obi', avatar: 'AO', mutualFriends: 2, class: 'JSS 3A' }].map(s => (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                      {s.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.mutualFriends} mutual friends · {s.class}</div>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-600 text-blue-600 text-xs rounded-lg hover:bg-blue-50">
                      <UserPlus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: '70vh' }}>
            <div className="grid grid-cols-3 h-full">
              {/* Conversation list */}
              <div className="border-r border-gray-200 overflow-y-auto">
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input placeholder="Search messages..." className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 rounded-lg border-0 outline-none" />
                  </div>
                </div>
                {[
                  { id: '1', name: 'Chioma Eze', avatar: 'CE', lastMessage: 'Are you coming to the study group?', time: '2m', unread: 2 },
                  { id: '2', name: 'Ibrahim Musa', avatar: 'IM', lastMessage: 'Thanks for the notes!', time: '1h', unread: 0 },
                  { id: '3', name: 'Mrs. Fatima Okafor', avatar: 'FO', lastMessage: 'Please submit your assignment', time: '3h', unread: 1 },
                  { id: '4', name: 'Tunde Bakare', avatar: 'TB', lastMessage: 'Did you see the sports results?', time: '1d', unread: 0 },
                ].map((conv, i) => (
                  <div key={conv.id} className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors ${i === 0 ? 'bg-blue-50' : ''}`}>
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
                      {conv.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{conv.name}</span>
                        <span className="text-xs text-gray-400">{conv.time}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-gray-500 truncate">{conv.lastMessage}</span>
                        {conv.unread > 0 && (
                          <span className="w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat window */}
              <div className="col-span-2 flex flex-col">
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold">CE</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Chioma Eze</div>
                    <div className="text-xs text-green-500 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online</div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {[
                    { from: 'them', text: 'Hey! Are you coming to the study group today?', time: '2:30 PM' },
                    { from: 'me', text: 'Yes! I\'ll be there at 3pm. I\'ve been reviewing chapters 5-7', time: '2:32 PM' },
                    { from: 'them', text: 'Perfect! Ibrahim is also joining us. We\'ll be at the library', time: '2:33 PM' },
                    { from: 'me', text: 'Great, see you there! 📚', time: '2:35 PM' },
                  ].map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${
                        msg.from === 'me'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.from === 'me' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Image className="w-5 h-5" /></button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Smile className="w-5 h-5" /></button>
                    <input
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-50 rounded-lg px-4 py-2.5 text-sm border-0 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="p-2.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
