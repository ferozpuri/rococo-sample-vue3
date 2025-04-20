<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Update Profile</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="firstName"
          label="First Name"
          outlined
          :error="!!error"
          :error-message="error"
          :disable="loading"
          class="q-mb-sm"
        />
        <q-input
          v-model="lastName"
          label="Last Name"
          outlined
          :error="!!error"
          :error-message="error"
          :disable="loading"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="closeDialog" :disable="loading" />
        <q-btn
          flat
          label="Update"
          color="primary"
          @click="updateProfile"
          :loading="loading"
          :disable="!firstName.trim() || !lastName.trim()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from 'stores/user'
import { useAuthStore } from 'stores/auth'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  user: {
    type: Object,
    required: false,
    default: () => null,
  },
})

const emit = defineEmits(['update:modelValue'])

const userStore = useUserStore()
const authStore = useAuthStore()
const firstName = ref('')
const lastName = ref('')
const error = ref('')
const loading = ref(false)

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Watch for dialog visibility changes
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.user) {
      firstName.value = props.user.first_name || ''
      lastName.value = props.user.last_name || ''
    }
  },
)

// Watch for user prop changes
watch(
  () => props.user,
  (newUser) => {
    if (newUser && props.modelValue) {
      firstName.value = newUser.first_name || ''
      lastName.value = newUser.last_name || ''
    }
  },
  { immediate: true },
)

function closeDialog() {
  showDialog.value = false
  firstName.value = ''
  lastName.value = ''
  error.value = ''
}

async function updateProfile() {
  if (!firstName.value.trim() || !lastName.value.trim()) return

  loading.value = true
  error.value = ''

  const success = await userStore.updateProfile({
    first_name: firstName.value.trim(),
    last_name: lastName.value.trim(),
  })
  if (success) {
    // Fetch the latest user data to ensure all components have the updated information
    await authStore.fetchUser()
    closeDialog()
  } else {
    error.value = userStore.error
  }

  loading.value = false
}
</script>
