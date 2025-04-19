import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import axios from 'config/axios'
import { useAuthStore } from 'stores/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
  }),

  actions: {
    async updateProfile({ first_name, last_name }) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.put('/person/me', { first_name, last_name })
        if (response.data?.success) {
          this.user = response.data.user
          const authStore = useAuthStore()
          authStore.user = {
            ...authStore.user,
            first_name,
            last_name,
          }
          Notify.create({
            message: 'Profile updated successfully',
            color: 'positive',
          })
          return true
        }
        throw new Error(response.data?.message || 'Failed to update profile')
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        Notify.create({
          message: this.error,
          color: 'negative',
        })
        return false
      } finally {
        this.loading = false
      }
    },
  },
})
