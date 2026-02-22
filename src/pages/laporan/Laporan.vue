<template>
  <VCard>
    <VTabs v-model="tab">
      <VTab key="laporan-harian"> Penjualan Harian </VTab>
      <VTab key="transaksi-harian"> Transaksi Harian </VTab>
      <VTab v-if="lapBulananRole.includes(appStore.role)" key="laporan-bulanan">
        Penjualan Bulanan
      </VTab>
    </VTabs>

    <VWindow v-model="tab">
      <VWindowItem key="laporan-harian">
        <LapHarian />
      </VWindowItem>
      <VWindowItem key="transaksi-harian">
        <LapTransHarian />
      </VWindowItem>
      <VWindowItem key="laporan-bulanan">
        <LapPenjualanBulanan />
      </VWindowItem>
    </VWindow>
  </VCard>
</template>

<script setup>
import { ref } from 'vue'
import LapHarian from './LapHarian.vue'
import LapTransHarian from './LapTransHarian.vue'
import LapPenjualanBulanan from './LapPenjualanBulanan.vue'
import { useAppStore } from '@/stores/appStore'

const appStore = useAppStore()

const lapBulananRole = ['admin']

const tab = ref(null)
</script>
