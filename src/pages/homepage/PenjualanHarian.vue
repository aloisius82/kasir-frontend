<template>
  <VCol v-if="appStore.isLogin" cols="12" sm="6" md="4">
    <v-card :variant="variant" :color="color">
      <v-card-title class="d-flex align-center">
        Penjualan Hari Ini
        <v-spacer></v-spacer>
        <v-btn icon size="small" @click="fetchDailySales" variant="text">
          <v-icon>{{ mdiIcon.mdiRefresh }}</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div v-if="loading" class="d-flex justify-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <div v-else>
          <h2 class="text-h4">{{ formatCurrency(dailySales) }}</h2>
          <p class="text-caption">Data diperbarui setiap 5 menit</p>
        </div>
      </v-card-text>
    </v-card>
  </VCol>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  VCol,
  VCard,
  VCardTitle,
  VCardText,
  VProgressCircular,
  VBtn,
  VIcon,
  VSpacer
} from 'vuetify/lib/components/index.mjs'
import { useAppStore } from '@/stores/appStore'
import * as mdiIcon from '@mdi/js'

const appStore = useAppStore()

const variant = ref('outlined')
const color = ref('indigo')
const dailySales = ref(0)
const loading = ref(false)
let intervalId = null

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fetchDailySales = async () => {
  loading.value = true
  try {
    const today = getTodayDate()
    const response = await appStore.axiosGet('/penjualan/report/daily-sales', {
      params: { date: today },
      auth: true
    })
    if (response && response.data) {
      try {
        if (response.data.length === 0) {
          dailySales.value = 0
          return
        }
        dailySales.value = response.data[0].total || 0
      } catch (error) {
        console.error('Failed to parse daily sales data:', error)
      }
    }
  } catch (error) {
    console.error('Failed to fetch daily sales:', error)
    dailySales.value = 0 // Reset on error
  } finally {
    loading.value = false
  }

  //'http://192.168.18.187:3000/penjualan/report/daily-sales?date=2026-01-08
}

onMounted(() => {
  fetchDailySales()
  intervalId = setInterval(fetchDailySales, 300000) // 5 minutes
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>
