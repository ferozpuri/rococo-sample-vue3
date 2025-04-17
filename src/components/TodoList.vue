<template>
  <div class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <q-input v-model="newTask.title" label="Task title" outlined class="q-mb-sm" />
        <q-input
          v-model="newTask.description"
          label="Task description"
          outlined
          type="textarea"
          class="q-mb-md"
        />
        <div class="row">
          <q-btn
            color="primary"
            icon="add"
            label="Add Task"
            @click="addTask"
            :disable="!newTask.title"
            class="q-px-md"
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
        <q-item v-for="task in filteredTasks" :key="task.entity_id" clickable v-ripple>
          <q-item-section avatar>
            <q-checkbox
              v-model="task.is_completed"
              @update:model-value="updateTask(task.entity_id, { is_completed: task.is_completed })"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label :class="{ 'text-strike': task.is_completed }">
              {{ task.title }}
            </q-item-label>
            <q-item-label caption v-if="task.description">
              {{ task.description }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row">
              <q-btn flat round dense icon="edit" @click="editTask(task)" />
              <q-btn flat round dense icon="delete" @click="deleteTask(task.entity_id)" />
            </div>
          </q-item-section>
        </q-item>

        <q-item v-if="filteredTasks.length === 0">
          <q-item-section>
            <q-item-label class="text-center text-grey"> No tasks found </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-list>

    <q-dialog v-model="editDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Edit Task</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="editingTask.title" label="Task title" outlined autofocus />
          <q-input
            v-model="editingTask.description"
            label="Task description"
            outlined
            type="textarea"
            class="q-mt-sm"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveEdit" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTodoStore } from 'stores/todo'

const todoStore = useTodoStore()
const newTask = ref({ title: '', description: '' })
const editDialog = ref(false)
const editingTask = ref({ entity_id: null, title: '', description: '', is_completed: false })

const filteredTasks = computed(() => todoStore.filteredTasks)
const filter = computed(() => todoStore.filter)

onMounted(() => {
  todoStore.fetchTasks()
})

async function addTask() {
  if (newTask.value.title.trim()) {
    const success = await todoStore.addTask(
      newTask.value.title.trim(),
      newTask.value.description.trim(),
    )
    if (success) {
      newTask.value = { title: '', description: '' }
    }
  }
}

function editTask(task) {
  editingTask.value = { ...task }
  editDialog.value = true
}

async function saveEdit() {
  if (editingTask.value.title.trim()) {
    await todoStore.updateTask(editingTask.value.entity_id, {
      title: editingTask.value.title.trim(),
      description: editingTask.value.description.trim(),
    })
  }
}

async function deleteTask(taskId) {
  await todoStore.deleteTask(taskId)
}

function setFilter(newFilter) {
  todoStore.setFilter(newFilter)
}
</script>
