import axios from 'axios'
import { useAuthStore } from 'stores/auth'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'

const API_URL = process.env.VUE_APP_API_URL

const apiClient = axios.create({
  baseURL: API_URL, // Set the base URL
  headers: {
    'Content-Type': 'application/json', // Default headers
  },
})

// Add a request interceptor to include the auth token
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.isAuthenticated) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
  }
  return config
})

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      const router = useRouter()

      // Clear auth data
      authStore.logout()

      // Redirect to login
      router.push('/login')

      // Show notification
      Notify.create({
        message: 'Your session has expired. Please login again.',
        color: 'warning',
        timeout: 3000,
      })
    }
    return Promise.reject(error)
  },
)

export default apiClient
