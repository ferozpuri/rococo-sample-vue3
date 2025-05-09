import { defineStore, acceptHMRUpdate } from 'pinia'
import { Notify } from 'quasar'
import axios from 'config/axios'
import localStorageService from 'services/localStorage.service'

import { handleAuthRequest } from '@/utils/apiHelper'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: localStorageService.getItem('user') || null, // Initialize from localStorage
    accessToken: localStorageService.getItem('accessToken') || null, // Initialize from localStorage
    accessTokenExpiry: localStorageService.getItem('accessTokenExpiry') || null, // Initialize from localStorage
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async fetchUser() {
      return handleAuthRequest(this, () => axios.get('/person/me'))
    },

    async signup(payload) {
      let response
      try {
        response = await axios.post('/auth/signup', payload)
      } catch {
        Notify.create({
          message: 'An unknown error occurred',
          color: 'danger',
        })
        return false
      }

      if (response.data?.success) {
        return true
      } else {
        Notify.create({
          message: response.data?.message,
          color: 'danger',
        })
      }
    },

    async login(payload) {
      return handleAuthRequest(this, () => axios.post('/auth/login', payload), this.router)
    },

    async forgotPassword(email) {
      try {
        const response = await axios.post('/auth/forgot_password', { email })
        if (response.data?.success) {
          Notify.create({
            message: 'Password reset link has been sent to your email',
            color: 'positive',
          })
          return true
        }
      } catch (error) {
        Notify.create({
          message:
            error.response?.data?.message || 'An error occurred while processing your request',
          color: 'danger',
        })
        return false
      }
    },

    async setPassword(token, uidb64, payload) {
      return handleAuthRequest(
        this,
        () => axios.post(`/auth/reset_password/${token}/${uidb64}`, payload),
        this.router,
      )
    },

    async logout() {
      localStorageService.clear()
      this.user = null
      this.accessToken = null
      this.accessTokenExpiry = null
      this.router.push('/login')
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
