<template>
  <VDialog v-model="dialog" width="600">
    <template #activator="{ props }">
      <VBtn color="primary" v-bind="props">Tambah User</VBtn>
    </template>
    <VCard>
      <VCardTitle>Tambah User Baru</VCardTitle>
      <VCardText>
        <VForm @submit.prevent="submit">
          <VTextField v-model="formData.username" label="Username" required class="mb-2" />
          <VSelect v-model="formData.role" :items="roles" label="Role" required class="mb-2" />
          <VRow>
            <VCol>
              <VTextField
                v-model="formData.password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? mdiEye : mdiEyeOff"
                @click:append-inner="showPassword = !showPassword"
                required
              />
            </VCol>
            <VCol cols="auto">
              <VBtn height="56" variant="tonal" @click="setDefaultPassword">Default</VBtn>
            </VCol>
            <VCol cols="auto">
              <VBtn height="56" variant="tonal" @click="generatePassword">Generate</VBtn>
            </VCol>
          </VRow>
          <VBtn type="submit" color="primary" block class="mt-4">Simpan</VBtn>
        </VForm>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="dialog = false">Batal</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { mdiEye, mdiEyeOff } from '@mdi/js'

const appStore = useAppStore()
const { axiosPost, snackbar } = appStore

const emit = defineEmits(['created'])

const dialog = ref(false)
const roles = ['admin', 'kasir', 'owner', 'finance', 'user']
const formData = ref({ username: '', role: 'user', password: '' })
const showPassword = ref(false)

watch(dialog, (val) => {
  if (val) {
    formData.value = { username: '', role: 'user', password: '' }
    showPassword.value = false
  }
})

function setDefaultPassword() {
  formData.value.password = '123456'
}

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  formData.value.password = password
}

function submit() {
  axiosPost('/user/create', formData.value, { auth: true }).then((res) => {
    if (res.status === 201 || res.status === 200) {
      snackbar('User berhasil dibuat', 'success')
      emit('created')
      dialog.value = false
    } else {
      snackbar('Gagal membuat user', 'error')
    }
  })
}
</script>
<style scoped></style>
