<template>
  <VContainer>
    <VCard>
      <VCardTitle>
        <span class="headline">{{ formTitle }}</span>
      </VCardTitle>

      <VCardText>
        <VContainer>
          <VForm ref="form">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="supplier.nama"
                  label="Nama Supplier"
                  :rules="[rules.required]"
                ></VTextField>
              </VCol>
              <VCol cols="12">
                <VTextarea
                  v-model="supplier.alamat"
                  label="Alamat"
                  :rules="[rules.required]"
                ></VTextarea>
              </VCol>
              <VCol cols="12" sm="6">
                <VTextField v-model="supplier.telepon" label="Telepon"></VTextField>
              </VCol>
              <VCol cols="12" sm="6">
                <VTextField v-model="supplier.pic" label="PIC"></VTextField>
              </VCol>
              <VCol cols="12" sm="6">
                <VTextField v-model="supplier.picPhone" label="Telepon PIC"></VTextField>
              </VCol>
            </VRow>
          </VForm>
        </VContainer>
      </VCardText>

      <VCardActions>
        <VSpacer></VSpacer>
        <VBtn color="blue-darken-1" variant="text" @click="close"> Batal </VBtn>
        <VBtn color="blue-darken-1" variant="text" @click="save"> Simpan </VBtn>
      </VCardActions>
    </VCard>
  </VContainer>
</template>

<script setup>
import { ref, computed } from 'vue'
const route = useRoute()
const router = useRouter()
const { axiosGet, axiosPost, axiosPut, snackbar } = useAppStore()
import { useAppStore } from '@/stores/appStore'

const form = ref(null)
const supplier = ref({
  id: null,
  nama: '',
  alamat: '',
  telepon: '',
  pic: '',
  picPhone: ''
})

const formTitle = computed(() => (supplier.value.id ? 'Edit Supplier' : 'Supplier Baru'))

const rules = {
  required: (value) => !!value || 'Wajib diisi.'
}

const close = () => {
  router.push('/Supplier')
}
const save = async () => {
  const { valid } = await form.value.validate()
  if (valid) {
    try {
      if (supplier.value.id) {
        await axiosPut(`/supplier/${supplier.value.id}`, supplier.value)
      } else {
        await axiosPost('/supplier', {
          nama: supplier.value.nama,
          alamat: supplier.value.alamat,
          telepon: supplier.value.telepon,
          pic: supplier.value.pic,
          picPhone: supplier.value.picPhone
        })
      }
      snackbar('Data supplier berhasil disimpan.', 'success')
      close()
    } catch (error) {
      snackbar('Gagal menyimpan data supplier.', 'error')
      console.error(error)
    }
  }
}

onMounted(() => {
  // const urlParams = new URLSearchParams(window.location.search)
  const id = route.query.id
  if (id && id !== 'new') {
    axiosGet(`/supplier/${id}`).then((response) => {
      supplier.value = response.data
    })
  }
})
</script>
