<template>
  <VCard>
    <VCardTitle>Profil Pengguna</VCardTitle>
    <VCardText>
      <VRow>
        <VCol cols="12" md="6">
          <VTextField label="Username" :model-value="user" readonly variant="outlined" />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField label="Role" :model-value="role" readonly variant="outlined" />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>

  <VCard class="mt-6">
    <VCardTitle>Ganti Password</VCardTitle>
    <VCardText>
      <VForm @submit.prevent="changePassword">
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="passwordForm.oldPassword"
              label="Password Lama"
              type="password"
              variant="outlined"
              :rules="[rules.required]"
            />
          </VCol>
          <VCol cols="12">
            <VTextField
              v-model="passwordForm.newPassword"
              label="Password Baru"
              type="password"
              variant="outlined"
              :rules="[rules.required, rules.minLength]"
            />
          </VCol>
          <VCol cols="12">
            <VTextField
              v-model="passwordForm.confirmPassword"
              label="Konfirmasi Password Baru"
              type="password"
              variant="outlined"
              :rules="[rules.required, passwordMatch]"
            />
          </VCol>
        </VRow>
        <VCardActions>
          <VSpacer />
          <VBtn type="submit" color="primary">Ganti Password</VBtn>
        </VCardActions>
      </VForm>
    </VCardText>
  </VCard>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { storeToRefs } from 'pinia'

const store = useAppStore()
const { user, role } = storeToRefs(store)
const { axiosPost, snackbar } = store

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  required: (value) => !!value || 'Wajib diisi.',
  minLength: (value) => value.length >= 6 || 'Minimal 6 karakter.'
}

const passwordMatch = () =>
  passwordForm.newPassword === passwordForm.confirmPassword || 'Password tidak cocok.'

async function changePassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    snackbar('Password baru tidak cocok dengan konfirmasi.', 'error')
    return
  }
  if (passwordForm.newPassword.length < 6) {
    snackbar('Password baru minimal 6 karakter.', 'error')
    return
  }

  try {
    const { oldPassword, newPassword } = passwordForm
    const response = await axiosPost(
      '/user/change-password',
      {
        //user/change-password
        oldPassword: oldPassword,
        newPassword: newPassword,
        confrimNewPassword: passwordForm.confirmPassword
      },
      {
        auth: true
      }
    )

    //  "oldPassword": "password",
    //   "newPassword": "12345678",
    //   "confrimNewPassword": "12345678"

    if (response.status === 200 || response.status === 201) {
      snackbar('Password berhasil diubah.', 'success')
      // Reset form
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } else {
      const errorMessage = response.data?.message || 'Gagal mengubah password.'
      snackbar(errorMessage, 'error')
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Terjadi kesalahan.'
    snackbar(errorMessage, 'error')
  }
}
</script>
