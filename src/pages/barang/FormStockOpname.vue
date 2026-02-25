<template>
  <div class="d-flex justify-end mb-2">
    <VContainer fluid>
      <VCard>
        <VCardTitle>Stock Opname </VCardTitle>
        <VCardText>
          <VForm ref="form">
            <VRow>
              <VCol cols="12">
                <VTextField v-model="tanggal" label="Tanggal" type="date"></VTextField>
              </VCol>
              <VCol cols="12">
                <VTextField v-model="keterangan" label="Keterangan" type="text"></VTextField>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VAutocomplete
                  v-model="selectedBarang"
                  v-model:search="searchTerm"
                  :items="filterBarang"
                  item-title="nama"
                  item-value="id"
                  label="Pilih Barang"
                  return-object
                  @update:model-value="onBarangSelected"
                >
                </VAutocomplete>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VDataTable
                  :headers="headers"
                  :items="stockOpnameItems"
                  :items-per-page="-1"
                  class="elevation-1"
                >
                  <template #item.qtyFisik="{ item }">
                    <VTextField
                      v-model.number="item.raw.qtyFisik"
                      type="number"
                      density="compact"
                      hide-details
                      @update:model-value="calculateSelisih(item.raw)"
                    ></VTextField>
                  </template>
                  <template #item.actions="{ item }">
                    <VBtn
                      icon="mdi-delete"
                      size="small"
                      color="error"
                      variant="text"
                      @click="removeBarang(item.raw)"
                    />
                  </template>
                </VDataTable>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardActions>
          <VBtn color="primary" @click="submit">Submit</VBtn>
        </VCardActions>
      </VCard>
    </VContainer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
import { useBarangStore } from '@/stores/barangStore'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/appStore'

const { axiosGet, snackbar } = useAppStore()

// const tanggal = ref('')
const { todayLocalDateString } = useAppStore()
const tanggal = ref(todayLocalDateString)
const keterangan = ref('')
const form = ref(null)

const listBarang = ref([])
const selectedBarang = ref(null)
const filterBarang = ref('')
const stockOpnameItems = ref([])

const searchTerm = ref('')

const barangStore = useBarangStore()

const headers = [
  { title: 'Nama Barang', key: 'nama', width: '30%' },
  { title: 'Stok Fisik', key: 'qtyFisik', align: 'center', width: '150px' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
]

watch(searchTerm, (newVal) => {
  if (newVal) {
    filterBarang.value = listBarang.value.filter((b) =>
      b.nama.toLowerCase().includes(newVal.toLowerCase())
    )
  } else {
    filterBarang.value = []
  }
})

const submit = () => {
  console.log('submit', { tanggal: tanggal.value, keterangan: keterangan.value })
}

async function fetchBarang() {
  try {
    const { data } = await axiosGet('/barang')
    listBarang.value = data
  } catch (error) {
    snackbar('Gagal memuat data barang', 'error')
  }
}

onMounted(() => {
  fetchBarang()
})

const onBarangSelected = (barang) => {
  if (barang) {
    const exists = stockOpnameItems.value.find((b) => b.id === barang.id)
    if (exists) {
      snackbar('Barang sudah ada di list', 'warning')
    } else {
      stockOpnameItems.value.push({
        id: barang.id,
        nama: barang.nama,
        qty: barang.qty,
        qtyFisik: 0,
        selisih: -barang.qty
      })
    }
    selectedBarang.value = null
  }
}

const calculateSelisih = (item) => {
  item.selisih = item.qtyFisik - item.qty
}

const removeBarang = (item) => {
  const index = stockOpnameItems.value.indexOf(item)
  if (index > -1) {
    stockOpnameItems.value.splice(index, 1)
  }
}
</script>
