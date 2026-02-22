import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLaporanStore = defineStore('laporan', () => {
  const dailyReport = ref([])
  const headers = ref([
    { title: 'Nama Barang', key: 'name' },
    { title: 'Jumlah Penjualan', key: 'sales' },
    { title: 'Harga Satuan', key: 'price' },
    { title: 'Subtotal', key: 'subtotal' }
  ])

  // Dummy data, will be replaced by API call
  const dummyData = [
    {
      name: 'Kopi Kapal Api',
      sales: 10,
      price: 1500,
      subtotal: 15000
    },
    {
      name: 'Indomie Goreng',
      sales: 25,
      price: 3000,
      subtotal: 75000
    },
    {
      name: 'Teh Pucuk Harum',
      sales: 15,
      price: 3500,
      subtotal: 52500
    }
  ]

  function fetchDailyReport(date) {
    // TODO: Replace with actual API call
    console.log(`Fetching daily report for ${date}`)
    dailyReport.value = dummyData
  }

  return { dailyReport, headers, fetchDailyReport }
})
