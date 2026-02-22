<template>
  <div>
    <VCardTitle class="d-flex justify-space-between align-center">
      User Management
      <FormUser @created="getUsers" />
    </VCardTitle>
    <VCardText>
      <VDataTable class="elevation-1" :headers="headers" :items="users" item-key="id">
        <template #item.actions="{ item }">
          <VBtn
            :prepend-icon="mdiIcon.mdiRefresh"
            size="small"
            variant="outlined"
            @click="resetPassword(item.raw.id)"
          >
            Reset Password
          </VBtn>
          <VBtn icon @click="deleteUser(item.id)">
            <VIcon>{{ mdiIcon.mdiDelete }}</VIcon>
          </VBtn>
        </template>
        <template #item.role="{ item }">
          {{ item.raw.role }}
          <VBtn variant="outlined" size="small" @click="openChangeRoleDialog(item.raw)"
            >Change</VBtn
          >
        </template>
      </VDataTable>
    </VCardText>

    <!-- Change Role Dialog -->
    <VDialog v-model="isChangeRoleDialogOpen" max-width="500px">
      <VCard>
        <VCardTitle>
          <span class="headline">Change Role</span>
        </VCardTitle>
        <VCardText>
          <VContainer>
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="editingUser.username"
                  label="Username"
                  readonly
                  disabled
                ></VTextField>
              </VCol>
              <VCol cols="12">
                <VSelect v-model="editingUser.role" :items="roles" label="Role"></VSelect>
              </VCol>
            </VRow>
          </VContainer>
        </VCardText>
        <VCardActions>
          <VSpacer></VSpacer>
          <VBtn color="blue darken-1" text @click="closeChangeRoleDialog">Cancel</VBtn>
          <VBtn color="blue darken-1" text @click="confirmChangeRole">Confirm</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { VDataTable } from 'vuetify/labs/VDataTable'
import * as mdiIcon from '@mdi/js'
import FormUser from './FormUser.vue'

const headers = ref([
  { title: 'Username', key: 'username' },
  // { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Actions', key: 'actions', sortable: false }
])

const users = ref([])
const { axiosGet, axiosPost, axiosPatch, snackbar } = useAppStore()

const isChangeRoleDialogOpen = ref(false)
const editingUser = ref({ username: '', role: '' })
const roles = ref(['admin', 'kasir', 'owner', 'finance', 'user'])

const getUsers = () => {
  axiosGet('/user/user/list').then((response) => {
    if (response.status === 200 || response.status === 204) {
      users.value = response.data
    }
  })
}

onMounted(() => {
  getUsers()
})

const deleteUser = (id) => {
  // Add your delete logic here
  console.log('Delete user:', id)
}

const resetPassword = (id) => {
  // /user/user/reset-
  axiosPost('/user/user/reset-password', { userId: id }, { auth: true }).then(async (res) => {
    if (res.status === 200 || res.status === 201) {
      snackbar('Password berhasil direset.', 'success')
      getUsers()
    }
  })
  console.log('Reset password for user:', id)
}

const openChangeRoleDialog = (user) => {
  editingUser.value = { ...user }
  isChangeRoleDialogOpen.value = true
}

const closeChangeRoleDialog = () => {
  isChangeRoleDialogOpen.value = false
}

const confirmChangeRole = () => {
  // Here you would typically make an API call to update the user's role
  console.log('Changing role for:', editingUser.value)
  // For now, let's just update the local data as a mock
  const index = users.value.findIndex((u) => u.id === editingUser.value.id)
  if (index !== -1) {
    users.value[index].role = editingUser.value.role
    axiosPatch(
      `/user/${editingUser.value.id}/role`,
      { role: editingUser.value.role },
      { auth: true }
    ).then((res) => {
      if (res.status === 200 || res.status === 204) {
        snackbar('Role updated successfully.', 'success')
        getUsers()
      }
    })
  }
  closeChangeRoleDialog()
  // snackbar('Role updated successfully (mock).', 'success')
  // You might want to call getUsers() again after a real API call
}
</script>
