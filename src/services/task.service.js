import axios from 'config/axios'

export const TaskService = {
  async getAllTasks(page = 1, perPage = 5) {
    const response = await axios.get(`/tasks?page=${page}&per_page=${perPage}`)
    return response.data
  },

  async getTaskById(taskId) {
    const response = await axios.get(`/tasks/${taskId}`)
    return response.data
  },

  async createTask(taskData) {
    const response = await axios.post('/tasks', taskData)
    return response.data
  },

  async updateTask(taskId, taskData) {
    const response = await axios.put(`/tasks/${taskId}`, taskData)
    return response.data
  },

  async patchTask(taskId, isCompleted) {
    const response = await axios.patch(`/tasks/${taskId}`, { is_completed: isCompleted })
    return response.data
  },

  async deleteTask(taskId) {
    const response = await axios.delete(`/tasks/${taskId}`)
    return response.data
  },

  async getCompletedTasks(page = 1, perPage = 2) {
    const response = await axios.get(`/tasks?is_completed=true&page=${page}&per_page=${perPage}`)
    return response.data
  },

  async getPendingTasks(page = 1, perPage = 2) {
    const response = await axios.get(`/tasks?is_completed=false&page=${page}&per_page=${perPage}`)
    return response.data
  }
} 