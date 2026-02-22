<template>
  <VCol v-if="appStore.isLogin && appStore.role === 'admin'" cols="126" md="6">
    <v-card :variant="variant" :color="color">
      <v-card-title class="d-flex align-center">
        Penjualan 7 Hari Terakhir
        <v-spacer></v-spacer>
        <v-btn icon size="small" @click="fetchLast7DaysSales" variant="text">
          <v-icon>{{ mdiIcon.mdiRefresh }}</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div v-if="loading" class="d-flex justify-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <v-table v-else>
          <thead>
            <tr>
              <th class="text-left">Tanggal</th>
              <th class="text-right">Total Penjualan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in last7DaysSales" :key="item.date">
              <td>{{ formatDate(item.date) }}</td>
              <td class="text-right">{{ formatCurrency(item.total) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="font-weight-bold">Rata-rata</td>
              <td class="text-right font-weight-bold">{{ formatCurrency(averageSales) }}</td>
            </tr>
          </tfoot>
        </v-table>
        <p class="text-caption mt-2">Data diperbarui setiap 5 menit</p>
      </v-card-text>
    </v-card>
  </VCol>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import {
  VCol,
  VCard,
  VCardTitle,
  VCardText,
  VProgressCircular,
  VTable,
  VBtn,
  VIcon,
  VSpacer
} from 'vuetify/lib/components/index.mjs'
import { useAppStore } from '@/stores/appStore'
import * as mdiIcon from '@mdi/js'

const appStore = useAppStore()

const variant = ref('outlined')
const color = ref('indigo')
const last7DaysSales = ref([]) // Will hold array of {date, total}
const loading = ref(false)
let intervalId = null

const averageSales = computed(() => {
  if (!last7DaysSales.value || last7DaysSales.value.length === 0) {
    return 0
  }
  const total = last7DaysSales.value.reduce((sum, item) => sum + item.total, 0)
  return total / last7DaysSales.value.length
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

const fetchLast7DaysSales = async () => {
  loading.value = true
  try {
    const response = await appStore.axiosGet('/penjualan/last7days')
    if (response && response.data && Array.isArray(response.data)) {
      // API returns a direct array: [ { date: '...', total: ... } ]
      last7DaysSales.value = response.data
    } else {
      last7DaysSales.value = []
    }
  } catch (error) {
    console.error('Failed to fetch last 7 days sales:', error)
    last7DaysSales.value = [] // Reset on error
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLast7DaysSales()
  intervalId = setInterval(fetchLast7DaysSales, 300000) // 5 minutes
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>
