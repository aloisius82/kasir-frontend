<template>
  <VCard class="ma-5" title="Form Barang">
    <VCardText>
      <VForm ref="formBarang">
        <VTextField
          v-model="formData.nama"
          :rules="[rules.required]"
          label="Nama Barang"
        ></VTextField>
        <VTextField v-model="formData.deskripsi" label="Deskripsi"></VTextField>
        <VTextField
          v-model="formData.hargaJual"
          :rules="[rules.required]"
          label="Harga Jual"
          type="number"
        >
        </VTextField>
        <VTextField v-model="formData.hargaBeli" label="Harga Beli" type="number"></VTextField>
        <VTextField v-model="formData.barcode" label="Barcode"></VTextField>
      </VForm>
    </VCardText>
    <VCardActions>
      <VSpacer></VSpacer>
      <VBtn color="primary" @click="save">Save</VBtn>
      <VBtn @click="close">Cancel</VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { axiosGet, axiosPost, axiosPut, snackbar } = useAppStore()

const formBarang = ref(null)
const formData = ref({
  nama: '',
  deskripsi: '',
  hargaJual: 0,
  hargaBeli: 0,
  barcode: ''
})

const rules = {
  required: (value) => !!value || 'This field is required'
}

onMounted(async () => {
  const id = route.query.id
  if (id === 'new') return
  if (id) {
    const response = await axiosGet(`/barang/${id}`)
    formData.value = response.data
  }
})

async function save() {
  const { valid } = await formBarang.value.validate()
  if (valid) {
    const id = route.query.id
    if (id === 'new') {
      await axiosPost('/barang', formData.value)
        .then(() => {
          snackbar('Barang berhasil ditambahkan', 'success')
        })
        .catch(() => {
          snackbar('Gagal menambahkan barang', 'error')
        })
    } else {
      await axiosPut(`/barang/${id}`, formData.value)
        .then(() => {
          snackbar('Barang berhasil diperbarui', 'success')
        })
        .catch(() => {
          snackbar('Gagal memperbarui barang', 'error')
        })
    }
    router.push('/barang')
  }
}

function close() {
  router.push('/barang')
}
</script>
