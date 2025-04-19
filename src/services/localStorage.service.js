export default {
  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  removeItem(key) {
    localStorage.removeItem(key)
  },
  getItem(key) {
    try {
      console.log('getItem => ', key, localStorage.getItem(key))
      return JSON.parse(localStorage.getItem(key))
    } catch (error) {
      console.error('Error parsing localStorage item:', error)
      return null
    }
  },
  clear() {
    localStorage.clear()
  },
}
