<template>
  <VContainer>
    <VRow>
      <VCol cols="6">
        <VBtn :disabled="!!device" :loading="isLoading" color="primary" @click="connectToPrinter"
          >Connect Printer</VBtn
        >
        <template v-if="!device">Hubungkan Printer</template>
        <template v-else>Terhubung: {{ device.name }}</template>
      </VCol>
      <VCol cols="6">
        <VBtn color="primary" @click="onPrintClick">Print Receipt (BT)</VBtn>
      </VCol>
      <VCol cols="12">
        {{ logs.value }}
      </VCol>
    </VRow>
    <VRow>
      <VCol cols="12">
        <div v-for="(log, i) in txtLog" :key="i">{{ i }} {{ log }}</div>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup>
import { ref } from 'vue'
import { useThermalPrint } from '@/composables/useThermalPrint'
const { device, isLoading, error, connectToPrinter, printReceipt, logs } = useThermalPrint()

const txtLog = ref([])

async function onPrintClick() {
  txtLog.value = []
  const params = {
    storeName: 'Apotek Pilang',
    storeAddress: 'Jl. Pilang Raya No.110',
    transactionId: 'TRX123456',
    items: [
      { name: 'Obat A', quantity: 2, hargaSatuan: 5000 },
      { name: 'Obat B', quantity: 1, hargaSatuan: 12000 },
      { name: 'Obat C', quantity: 3, hargaSatuan: 3000 }
    ],
    total: 34000,
    paid: 50000,
    change: 16000
  }
  try {
    await printReceipt(params)
  } catch (e) {
    // txtLog.value.push(`Error during printing: ${e.message}\n`)
    txtLog.value = logs.value
  } finally {
    txtLog.value = logs.value
  }
}
</script>
