import { Notify } from 'quasar' // Import Quasar's Notify
import localStorageService from '@/services/localStorage.service' // Import your localStorage service

export async function handleAuthRequest(store, requestFn, router = null) {
  let response
  try {
    response = await requestFn() // Execute the API request
  } catch {
    Notify.create({
      message: 'An unknown error occurred',
      color: 'danger',
    })
    return false
  }

  if (!response.data?.success) {
    Notify.create({
      message: response.data?.message,
      color: 'danger',
    })
    return false
  }

  const { person, access_token, expiry } = response.data
  store.user = person
  localStorageService.setItem('user', person)
  if (access_token) {
    store.accessToken = access_token
    localStorageService.setItem('accessToken', access_token)
  }
  if (expiry) {
    store.accessTokenExpiry = expiry
    localStorageService.setItem('accessTokenExpiry', expiry)
  }

  router && router.push('/dashboard')

  return true // Indicate success
}
