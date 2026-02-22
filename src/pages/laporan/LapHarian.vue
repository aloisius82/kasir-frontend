<template>
  <VContainer fluid>
    <VRow>
      <VCol cols="12" md="3">
        <VTextField
          v-model="date"
          type="date"
          label="Pilih Tanggal"
          density="compact"
          hide-details
        />
      </VCol>
      <VCol cols="12" md="4">
        <VBtn color="primary" @click="buatLaporan">Buat</VBtn>
        <VBtn color="success" class="ml-2" @click="exportToExcel" :disabled="!listBarang.length"
          >Export Excel</VBtn
        >
      </VCol>
    </VRow>
    <VRow>
      <VCol cols="12">
        <VDataTable :items-per-page="itemsPerPage" :headers="headers" :items="listBarang">
        </VDataTable>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup>
import { VDataTable } from 'vuetify/labs/VDataTable'
import { useAppStore } from '@/stores/appStore'
import { utils, writeFile } from 'xlsx'

const appStore = useAppStore()
const { axiosGet } = appStore

const date = ref(appStore.todayLocalDateString)
// const dateObj = ref(new Date())

const listBarang = ref([])
const totalItems = ref(0)
const itemsPerPage = ref(10)

const headers = ref([
  { title: 'Nama Barang', key: 'nama' },
  { title: 'Terjual', key: 'jumlah', align: 'end' },
  { title: 'Harga Jual', key: 'hargaSatuan', align: 'end' },
  { title: 'Total Penjualan', key: 'amount', align: 'end' }
])

const excelFields = {
  Item: 'nama',
  Terjual: 'jumlah',
  'Harga Jual': 'hargaSatuan',
  'Total Penjualan': 'amount'
}

const searchLaporanHarian = (page = 1) => {
  axiosGet('/penjualan/report/daily-items', {
    auth: true,
    params: { date: date.value, num: -1, page }
  }).then((response) => {
    if (response.status === 200) {
      listBarang.value = response.data
      // totalItems.value = response.data.total
    }
  })
}

const buatLaporan = () => {
  searchLaporanHarian(1)
}

const exportToExcel = () => {
  const data = listBarang.value.map((item) => {
    const row = {}
    for (const [key, value] of Object.entries(excelFields)) {
      row[key] = item[value]
    }
    return row
  })
  const ws = utils.json_to_sheet(data)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, `${date.value}`)
  writeFile(wb, `Laporan_Harian_${date.value}.xlsx`)
}
</script>
