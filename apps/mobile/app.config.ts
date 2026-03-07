import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'EduSuite',
  slug: 'edusuite',
  version: '3.0.0',
  orientation: 'portrait',
  icon: './src/assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'edusuite',

  splash: {
    image: './src/assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1e40af',
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.edusuite.app',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription: 'EduSuite uses your camera for live classes and face attendance verification.',
      NSMicrophoneUsageDescription: 'EduSuite uses your microphone for live classes.',
      NSLocationWhenInUseUsageDescription: 'EduSuite uses your location for transport tracking.',
      NSFaceIDUsageDescription: 'EduSuite uses Face ID for secure login.',
      NSPhotoLibraryUsageDescription: 'EduSuite needs access to your photos for profile pictures and assignment uploads.',
    },
  },

  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/adaptive-icon.png',
      backgroundColor: '#1e40af',
    },
    package: 'com.edusuite.app',
    versionCode: 1,
    permissions: [
      'CAMERA',
      'RECORD_AUDIO',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'VIBRATE',
      'RECEIVE_BOOT_COMPLETED',
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'ACCESS_FINE_LOCATION',
      'USE_BIOMETRIC',
      'USE_FINGERPRINT',
    ],
    googleServicesFile: './google-services.json',
  },

  web: {
    favicon: './src/assets/favicon.png',
    bundler: 'metro',
  },

  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow EduSuite to access your camera',
        microphonePermission: 'Allow EduSuite to access your microphone',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './src/assets/notification-icon.png',
        color: '#1e40af',
        sounds: ['./src/assets/sounds/notification.wav'],
      },
    ],
    [
      'expo-local-authentication',
      {
        faceIDPermission: 'Allow EduSuite to use Face ID for authentication.',
      },
    ],
    ['expo-location', { locationAlwaysAndWhenInUsePermission: 'Allow EduSuite to use your location for transport tracking.' }],
    'expo-secure-store',
    ['react-native-permissions', {
      permissions: {
        ios: ['CAMERA', 'MICROPHONE', 'PHOTO_LIBRARY', 'LOCATION_WHEN_IN_USE'],
        android: ['CAMERA', 'RECORD_AUDIO', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'ACCESS_FINE_LOCATION'],
      },
    }],
  ],

  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID || 'your-eas-project-id',
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
    webrtcUrl: process.env.EXPO_PUBLIC_WEBRTC_URL || 'http://localhost:4000',
    cloudinaryCloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },

  updates: {
    url: 'https://u.expo.dev/your-project-id',
    enabled: true,
    fallbackToCacheTimeout: 0,
    checkAutomatically: 'ON_LOAD',
  },

  runtimeVersion: {
    policy: 'appVersion',
  },

  experiments: {
    typedRoutes: true,
  },
})
