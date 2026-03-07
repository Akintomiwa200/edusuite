import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { api } from '../api/client'

// Configure how notifications are shown when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export class NotificationService {
  private static instance: NotificationService
  private responseSubscription: Notifications.EventSubscription | null = null
  private receivedSubscription: Notifications.EventSubscription | null = null

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  /**
   * Request permission and register device for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('Push notifications require a physical device')
      return null
    }

    // Check / request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission denied')
      return null
    }

    // Set notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'EduSuite Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1e40af',
      })

      await Notifications.setNotificationChannelAsync('live-class', {
        name: 'Live Class Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500],
        lightColor: '#10b981',
      })

      await Notifications.setNotificationChannelAsync('fees', {
        name: 'Fee Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#f59e0b',
      })
    }

    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })
    const token = tokenData.data

    // Register token with backend
    try {
      await api.post('/notifications/register-device', { token, platform: Platform.OS })
    } catch (err) {
      console.error('Failed to register device token', err)
    }

    return token
  }

  /**
   * Set up notification listeners
   */
  setupListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void,
  ) {
    // Remove existing subscriptions
    this.cleanup()

    // When notification is received while app is open
    this.receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      onNotificationReceived?.(notification)
    })

    // When user taps on a notification
    this.responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      this.handleNotificationResponse(response)
      onNotificationResponse?.(response)
    })
  }

  /**
   * Handle navigation when user taps notification
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data as Record<string, string>

    switch (data?.type) {
      case 'LIVE_CLASS':
        // Navigate to live class
        // router.push(`/student/live-class/${data.classId}`)
        break
      case 'FEES':
        // router.push(`/parent/fees/${data.studentId}`)
        break
      case 'ASSIGNMENT':
        // router.push(`/student/assignments/${data.assignmentId}`)
        break
      case 'RESULT':
        // router.push(`/student/results/${data.resultId}`)
        break
      default:
        break
    }
  }

  /**
   * Schedule a local notification (e.g., class reminder)
   */
  async scheduleLocalNotification(opts: {
    title: string
    body: string
    data?: Record<string, unknown>
    scheduledTime: Date
    identifier?: string
  }): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
      identifier: opts.identifier,
      content: {
        title: opts.title,
        body: opts.body,
        data: opts.data,
        sound: 'default',
      },
      trigger: {
        date: opts.scheduledTime,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      },
    })
    return id
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelScheduledNotification(identifier: string) {
    await Notifications.cancelScheduledNotificationAsync(identifier)
  }

  /**
   * Get all pending scheduled notifications
   */
  async getPendingNotifications() {
    return Notifications.getAllScheduledNotificationsAsync()
  }

  /**
   * Clear all delivered notifications from notification tray
   */
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync()
    await Notifications.setBadgeCountAsync(0)
  }

  /**
   * Set badge count (iOS)
   */
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count)
  }

  cleanup() {
    this.responseSubscription?.remove()
    this.receivedSubscription?.remove()
  }
}

export const notificationService = NotificationService.getInstance()
