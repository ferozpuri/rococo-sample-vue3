import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import axios from 'config/axios'

export const useTodoStore = defineStore('todo', {
  state: () => ({
    tasks: [],
    loading: false,
    filter: 'all', // 'all', 'active', 'completed'
    error: null,
  }),

  getters: {
    filteredTasks: (state) => {
      if (!state.tasks || !Array.isArray(state.tasks)) return []
      switch (state.filter) {
        case 'active':
          return state.tasks.filter((task) => !task.is_completed)
        case 'completed':
          return state.tasks.filter((task) => task.is_completed)
        default:
          return state.tasks
      }
    },
  },

  actions: {
    async fetchTasks() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/tasks')
        if (response.data?.success) {
          this.tasks = response.data.data || []
        } else {
          throw new Error(response.data?.message || 'Failed to fetch tasks')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        Notify.create({
          message: this.error,
          color: 'negative',
        })
        this.tasks = []
      } finally {
        this.loading = false
      }
    },

    async addTask(title, description = '') {
      this.error = null
      try {
        const response = await axios.post('/tasks', { title, description })
        if (response.data?.success) {
          this.tasks.push(response.data.data)
          Notify.create({
            message: 'Task added successfully',
            color: 'positive',
          })
          return true
        }
        throw new Error(response.data?.message || 'Failed to add task')
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        Notify.create({
          message: this.error,
          color: 'negative',
        })
        return false
      }
    },

    async updateTask(taskId, updates) {
      this.error = null
      try {
        const response = await axios.put(`/tasks/${taskId}`, updates)
        if (response.data?.success) {
          const index = this.tasks.findIndex((task) => task.id === taskId)
          if (index !== -1) {
            this.tasks[index] = response.data.data
          }
          Notify.create({
            message: 'Task updated successfully',
            color: 'positive',
          })
          return true
        }
        throw new Error(response.data?.message || 'Failed to update task')
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        Notify.create({
          message: this.error,
          color: 'negative',
        })
        return false
      }
    },

    async deleteTask(taskId) {
      this.error = null
      try {
        const response = await axios.delete(`/tasks/${taskId}`)
        if (response.data?.success) {
          this.tasks = this.tasks.filter((task) => task.id !== taskId)
          Notify.create({
            message: 'Task deleted successfully',
            color: 'positive',
          })
          return true
        }
        throw new Error(response.data?.message || 'Failed to delete task')
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        Notify.create({
          message: this.error,
          color: 'negative',
        })
        return false
      }
    },

    setFilter(filter) {
      this.filter = filter
    },

    async fetchCompletedTasks() {
      try {
        const response = await axios.get('/tasks/completed')
        if (response.data?.success) {
          this.tasks = response.data.data || []
        } else {
          throw new Error(response.data?.message || 'Failed to fetch completed tasks')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        Notify.create({
          message: this.error,
          color: 'negative',
        })
        this.tasks = []
      }
    },

    async fetchPendingTasks() {
      try {
        const response = await axios.get('/tasks/pending')
        if (response.data?.success) {
          this.tasks = response.data.data || []
        } else {
          throw new Error(response.data?.message || 'Failed to fetch pending tasks')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        Notify.create({
          message: this.error,
          color: 'negative',
        })
        this.tasks = []
      }
    },
  },
})
