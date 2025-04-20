import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import axios from 'config/axios'
import { TaskService } from 'services/task.service'

export const useTodoStore = defineStore('todo', {
  state: () => ({
    tasks: [],
    loading: false,
    filter: 'all', // 'all', 'active', 'completed'
    error: null,
    pagination: {
      page: 1,
      perPage: 5,
      total: 0,
      totalPages: 0,
    },
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
        let url = '/tasks'
        const params = {
          page: this.pagination.page,
          per_page: this.pagination.perPage,
        }

        if (this.filter === 'completed') {
          params.is_completed = 1
        } else if (this.filter === 'active') {
          params.is_completed = 0
        }

        const response = await axios.get(url, { params })
        if (response.data?.success) {
          this.tasks = response.data.tasks || []
          this.pagination = {
            ...this.pagination,
            page: response.data.pagination.page,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.total_pages,
          }
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

    setFilter(filter) {
      this.filter = filter
      this.pagination.page = 1 // Reset to first page when filter changes
      this.fetchTasks()
    },

    setPage(page) {
      this.pagination.page = page
      this.fetchTasks()
    },

    async addTask(title, description = '') {
      this.error = null
      try {
        const response = await axios.post('/tasks', { title, description })
        if (response.data?.success) {
          this.tasks.unshift(response.data.task)
          this.pagination.total += 1
          this.pagination.totalPages = Math.ceil(this.pagination.total / this.pagination.perPage)
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
          const index = this.tasks.findIndex((task) => task.entity_id === taskId)
          if (index !== -1) {
            this.tasks[index] = response.data.task
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

    async toggleTaskCompletion(taskId, isCompleted) {
      this.error = null
      try {
        const response = await TaskService.patchTask(taskId, isCompleted)
        if (response?.success) {
          const index = this.tasks.findIndex((task) => task.entity_id === taskId)
          if (index !== -1) {
            this.tasks[index] = response.task
          }
          Notify.create({
            message: 'Task status updated successfully',
            color: 'positive',
          })
          return true
        }
        throw new Error(response?.message || 'Failed to update task status')
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
          this.tasks = this.tasks.filter((task) => task.entity_id !== taskId)
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
