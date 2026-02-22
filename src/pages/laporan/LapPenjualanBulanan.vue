<template>
  <VContainer fluid>
    <VRow>
      <VCol cols="12" md="3">
        <VTextField
          v-model="month"
          type="month"
          label="Pilih Bulan"
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
        <VDataTableServer
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items="listBarang"
          :items-length="totalItems"
          @update:options="loadItems"
        >
          <template #item.hargaSatuan="{ item }">
            {{ formatCurrency(item.raw.hargaSatuan) }}
          </template>
          <template #item.amount="{ item }">
            {{ formatCurrency(item.raw.amount) }}
          </template>
        </VDataTableServer>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup>
import { ref } from 'vue'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { useAppStore } from '@/stores/appStore'
import { utils, writeFile } from 'xlsx'

const appStore = useAppStore()
const { axiosGet } = appStore

const month = ref(new Date().toISOString().substring(0, 7))

const listBarang = ref([])
const totalItems = ref(0)
const itemsPerPage = ref(10)

const headers = ref([
  { title: 'Nama Barang', key: 'nama' },
  { title: 'Terjual', key: 'jumlah', align: 'end' },
  { title: 'Harga Jual', key: 'hargaSatuan', align: 'end' },
  { title: 'Total Penjualan', key: 'amount', align: 'end' }
])

const formatCurrency = (value) => {
  const number = Number(value) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number)
}

const searchLaporanBulanan = (page = 1) => {
  console.log('Mencari laporan bulanan untuk:', month.value)
  axiosGet('/penjualan/report/monthly-items', {
    auth: true,
    params: { month: month.value, num: itemsPerPage.value, page }
  }).then((response) => {
    if (response.status === 200) {
      listBarang.value = response.data
      // totalItems.value = response.data.total
    }
  })
}

const buatLaporan = () => {
  searchLaporanBulanan(1)
}

const exportToExcel = () => {
  const data = listBarang.value.map((item) => ({
    'Nama Barang': item.nama,
    Terjual: item.jumlah,
    'Harga Jual': item.hargaSatuan,
    'Total Penjualan': item.amount
  }))
  const ws = utils.json_to_sheet(data)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Penjualan Bulanan')
  writeFile(wb, `Laporan_Penjualan_Bulanan_${month.value}.xlsx`)
}

const loadItems = (options) => {
  searchLaporanBulanan(options.page)
}
</script>

<style scoped></style>
