<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          v-if="authStore.isAuthenticated"
        />

        <q-toolbar-title> Rococo Sample </q-toolbar-title>

        <div v-if="authStore.isAuthenticated" class="cursor-pointer">
          Logged in as
          <b>{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</b>
          <q-icon size="xs" name="arrow_drop_down" />
          <q-menu fir anchor="bottom right" self="top right">
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup>
                <q-item-section @click="showProfileDialog = true">Update Profile</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section @click="authStore.logout()">Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-if="authStore.isAuthenticated" v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Profile Update Dialog -->
    <ProfileUpdateDialog v-model="showProfileDialog" :user="authStore.user" />
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useAuthStore } from 'stores/auth'
import ProfileUpdateDialog from 'components/ProfileUpdateDialog.vue'

const authStore = useAuthStore()

const linksList = [
  {
    title: 'Dashboard',
    icon: 'code',
    link: '/dashboard',
  },
  {
    title: 'Todo Tasks',
    icon: 'task',
    link: '/todos',
  },
]

const leftDrawerOpen = ref(false)
const showProfileDialog = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
