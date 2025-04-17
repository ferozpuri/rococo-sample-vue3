import axios from 'config/axios'

export const TaskService = {
  async getAllTasks() {
    const response = await axios.get('/task')
    return response.data
  },

  async getTaskById(taskId) {
    const response = await axios.get(`/task/${taskId}`)
    return response.data
  },

  async createTask(taskData) {
    const response = await axios.post('/task', taskData)
    return response.data
  },

  async updateTask(taskId, taskData) {
    const response = await axios.put(`/task/${taskId}`, taskData)
    return response.data
  },

  async deleteTask(taskId) {
    const response = await axios.delete(`/task/${taskId}`)
    return response.data
  },

  async getCompletedTasks() {
    const response = await axios.get('/task?is_completed=true')
    return response.data
  },

  async getPendingTasks() {
    const response = await axios.get('/task?is_completed=false')
    return response.data
  }
} 