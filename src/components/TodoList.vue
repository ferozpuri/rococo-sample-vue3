<template>
  <div class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <q-input v-model="taskForm.title" label="Task title" outlined class="q-mb-sm" />
        <q-input
          v-model="taskForm.description"
          label="Task description"
          outlined
          type="textarea"
          class="q-mb-md"
        />
        <div class="row">
          <q-btn
            color="primary"
            :icon="isEditing ? 'edit' : 'add'"
            :label="isEditing ? 'Update Task' : 'Add Task'"
            @click="isEditing ? saveEdit() : addTask()"
            :disable="!taskForm.title"
            class="q-px-md"
          />
          <q-btn
            v-if="isEditing"
            flat
            color="grey"
            icon="close"
            label="Cancel"
            @click="cancelEdit"
            class="q-ml-sm"
          />
        </div>
      </div>
    </div>

    <div class="row q-mb-md">
      <div class="col">
        <q-btn-group outline>
          <q-btn
            :color="filter === 'all' ? 'primary' : 'grey'"
            label="All"
            @click="setFilter('all')"
          />
          <q-btn
            :color="filter === 'active' ? 'primary' : 'grey'"
            label="Active"
            @click="setFilter('active')"
          />
          <q-btn
            :color="filter === 'completed' ? 'primary' : 'grey'"
            label="Completed"
            @click="setFilter('completed')"
          />
        </q-btn-group>
      </div>
    </div>

    <q-list bordered separator>
      <q-item v-if="todoStore.loading">
        <q-item-section>
          <q-item-label class="text-center text-grey"> Loading tasks... </q-item-label>
        </q-item-section>
      </q-item>
      <template v-else>
        <q-item v-for="task in todoStore.tasks" :key="task.entity_id" clickable v-ripple>
          <q-item-section avatar>
            <q-toggle
              v-model="task.is_completed"
              :true-value="true"
              :false-value="false"
              color="positive"
              @update:model-value="toggleTaskCompletion(task)"
            >
              <q-tooltip>
                {{ task.is_completed ? 'Mark as incomplete' : 'Mark as complete' }}
              </q-tooltip>
            </q-toggle>
          </q-item-section>

          <q-item-section>
            <q-item-label :class="{ 'text-strike': task.is_completed }">
              {{ task.title }}
            </q-item-label>
            <q-item-label caption v-if="task.description">
              {{
                task.description?.length > 300
                  ? task.description?.substring(0, 300) + '...'
                  : task.description
              }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row">
              <q-btn flat round dense icon="visibility" @click="showTaskDetails(task)" />
              <q-btn flat round dense icon="edit" @click="editTask(task)" />
              <q-btn flat round dense icon="delete" @click="deleteTask(task.entity_id)" />
            </div>
          </q-item-section>
        </q-item>

        <q-item v-if="todoStore.tasks.length === 0">
          <q-item-section>
            <q-item-label class="text-center text-grey"> No tasks found </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-list>

    <!-- Pagination Controls -->
    <div class="row justify-center q-mt-md" v-if="todoStore.pagination.totalPages > 1">
      <q-pagination
        v-model="todoStore.pagination.page"
        :max="todoStore.pagination.totalPages"
        :max-pages="5"
        direction-links
        boundary-links
        @update:model-value="todoStore.setPage"
      />
    </div>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteConfirmDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm text-h6">Confirm Delete</span>
        </q-card-section>

        <q-card-section>
          <div class="text-body1">Are you sure you want to delete this task?</div>
          <div class="text-body2 text-warning q-mt-sm">This action cannot be undone.</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="confirmDelete" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Detail Dialog -->
    <q-dialog v-model="detailDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Task Details</div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-sm text-bold">Title:</div>
          <div class="text-body1 q-mb-md">{{ detailTask.title }}</div>

          <div class="text-subtitle1 q-mb-sm text-bold">Description:</div>
          <div class="text-body1">{{ detailTask.description || 'No description provided' }}</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTodoStore } from 'stores/todo'

const todoStore = useTodoStore()
const taskForm = ref({ title: '', description: '' })
const isEditing = ref(false)
const editingTaskId = ref(null)
const detailDialog = ref(false)
const deleteConfirmDialog = ref(false)
const taskToDelete = ref(null)
const detailTask = ref({ title: '', description: '' })

const filter = computed(() => todoStore.filter)

onMounted(() => {
  todoStore.fetchTasks()
})

async function addTask() {
  if (taskForm.value.title.trim()) {
    const success = await todoStore.addTask(
      taskForm.value.title.trim(),
      taskForm.value.description.trim(),
    )
    if (success) {
      resetForm()
    }
  }
}

function editTask(task) {
  taskForm.value = {
    title: task.title,
    description: task.description || '',
  }
  editingTaskId.value = task.entity_id
  isEditing.value = true
}

async function saveEdit() {
  if (taskForm.value.title.trim()) {
    const success = await todoStore.updateTask(editingTaskId.value, {
      title: taskForm.value.title.trim(),
      description: taskForm.value.description.trim(),
    })
    if (success) {
      resetForm()
    }
  }
}

function cancelEdit() {
  resetForm()
}

function resetForm() {
  taskForm.value = { title: '', description: '' }
  isEditing.value = false
  editingTaskId.value = null
}

function showTaskDetails(task) {
  detailTask.value = { ...task }
  detailDialog.value = true
}

function deleteTask(taskId) {
  taskToDelete.value = taskId
  deleteConfirmDialog.value = true
}

async function confirmDelete() {
  if (taskToDelete.value) {
    await todoStore.deleteTask(taskToDelete.value)
    taskToDelete.value = null
  }
}

function setFilter(newFilter) {
  todoStore.setFilter(newFilter)
  todoStore.fetchTasks()
}

async function toggleTaskCompletion(task) {
  const success = await todoStore.toggleTaskCompletion(task.entity_id, task.is_completed)
  if (!success) {
    // If the API call fails, revert the toggle state
    task.is_completed = !task.is_completed
  }
}
</script>
