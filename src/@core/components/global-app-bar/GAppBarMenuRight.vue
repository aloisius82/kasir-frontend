<template>
  <div class="fixed right-0 mr-5 flex items-center">
    <VBtn
      :enabled="isLogin"
      :prepend-icon="mdiIcon.mdiAccountCircle"
      color="white"
      size="small"
      title="User"
      variant="text"
      @click="goToProfile"
      >{{ user || 'Quest' }}</VBtn
    >
    <VBtn
      v-if="isLogin"
      :prepend-icon="mdiIcon.mdiLogout"
      color="white"
      size="small"
      variant="text"
      @click="doLogout"
    >
      Logout
    </VBtn>
    <VBtn
      v-else
      :prepend-icon="mdiIcon.mdiLogout"
      color="white"
      size="small"
      variant="text"
      @click="dialog = true"
    >
      Login
    </VBtn>
  </div>
  <VDialog v-model="dialog" width="auto">
    <VCard :prepend-icon="mdiIcon.mdiLogin" max-width="400" min-width="350" title="Login">
      <template #actions>
        <VBtn class="ms-auto" variant="text" @click="dialog = false"></VBtn>
      </template>
      <VCardText>
        <VRow dense>
          <VCol cols="12" md="12" sm="12">
            <VTextField v-model="formData.username" label="Username*" required></VTextField>
          </VCol>
        </VRow>
        <VRow dense>
          <VCol cols="12" md="12" sm="12">
            <VTextField
              v-model="formData.password"
              label="Password*"
              required
              type="password"
            ></VTextField>
          </VCol>
        </VRow>
      </VCardText>
      <VDivider></VDivider>
      <VCardActions>
        <VBtn color="white" variant="elevated" @click="doLogin">Login</VBtn>
        <VBtn title="close" variant="text" @click="dialog = false">Close</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
<script setup>
import { ref } from 'vue'
import * as mdiIcon from '@mdi/js'
import { jwtDecode } from 'jwt-decode'

const router = useRouter()
const store = useAppStore()
const { token, user, isLogin, role } = toRefs(store)
const { axiosPost, snackbar } = store
const dialog = ref(false)

const formData = ref({ username: '', password: '' })

function goToProfile() {
  router.push('/profile')
}

function doLogin() {
  dialog.value = false
  const { username, password } = formData.value
  console.log('login test')
  axiosPost('/user/login', { username, password }, { auth: false })
    .then((res) => {
      console.log(res)
      if (res.status == 201) {
        token.value = res.data.access_token
        user.value = res.data.username
        const decoded = jwtDecode(token.value)
        role.value = decoded.role
        snackbar('Login successful', 'success')
      } else {
        snackbar('Login failed', 'error')
      }
    })
    .catch((e) => {
      console.log(e)
      snackbar('Login failed : ' + e.message, 'error')
    })
  formData.value.password = ''
  formData.value.username = ''
}

function doLogout() {
  store.logout()
  router.push('/')
  // this.$router.push('/')
  // $router
}
</script>
