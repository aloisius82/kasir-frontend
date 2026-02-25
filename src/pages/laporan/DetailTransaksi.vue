<template>
  <VDialog v-model="showDialog" width="600" @after-leave="onAfterLeave">
    <VCard v-if="transactionData">
      <VCardTitle class="d-flex justify-space-between align-center">
        <span>Detail Transaksi</span>
        <VBtn icon @click="showDialog = false" variant="text">
          <VIcon>{{ mdiIcon.mdiClose }}</VIcon>
        </VBtn>
      </VCardTitle>
      <VCardText>
        <VAlert v-if="error" type="error" density="compact" class="mb-4">{{ error }}</VAlert>
        <VRow>
          <VCol cols="12" md="6">
            <div><strong>ID Transaksi:</strong> {{ transactionData.id }}</div>
            <div><strong>Kasir:</strong> {{ transactionData.user?.username }}</div>
            <div><strong>Pembayaran:</strong> {{ transactionData.paymentType }}</div>
            <div><strong>Ref:</strong> {{ transactionData.paymentRef }}</div>
          </VCol>
          <VCol cols="12" md="6" class="text-md-right">
            <div><strong>Tanggal:</strong> {{ formatDate(transactionData.createdAt) }}</div>
          </VCol>
        </VRow>

        <VDivider class="my-4"></VDivider>

        <p class="text-h6">Rincian Barang</p>
        <VDataTable
          :headers="itemHeaders"
          :items="transactionData.detailPenjualan || []"
          density="compact"
          hide-default-footer
        >
          <template #item.hargaSatuan="{ item }">
            {{ formatCurrency(item.raw.hargaSatuan) }}
          </template>
          <template #item.subtotal="{ item }">
            {{ formatCurrency(item.raw.subtotal) }}
          </template>
        </VDataTable>

        <VDivider class="my-4"></VDivider>

        <div class="d-flex justify-end">
          <div class="text-h6">
            <strong>Total:</strong> {{ formatCurrency(transactionData.total) }}
          </div>
        </div>
      </VCardText>
      <VCardActions>
        <VSpacer></VSpacer>
        <VBtn
          :loading="isLoading"
          :disabled="!!device"
          @click="connectToPrinter"
          size="small"
          variant="tonal"
        >
          <template v-if="!device">Hubungkan Printer</template>
          <template v-else>Terhubung</template>
        </VBtn>
        <VBtn color="secondary" @click="print" :disabled="!device">Cetak Ulang</VBtn>
        <VBtn color="primary" @click="showDialog = false">Tutup</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
import * as mdiIcon from '@mdi/js'
import { useThermalPrint } from '@/composables/useThermalPrint'

const { device, isLoading, error, connectToPrinter, printReceipt } = useThermalPrint()

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  transactionData: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['onHide'])

const showDialog = ref(false)

const itemHeaders = [
  { title: 'Nama Barang', key: 'barang.nama', sortable: false },
  { title: 'Harga Satuan', key: 'hargaSatuan', align: 'end', sortable: false },
  { title: 'Jumlah', key: 'jumlah', align: 'center', sortable: false },
  { title: 'Subtotal', key: 'subtotal', align: 'end', sortable: false }
]

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

function formatCurrency(value) {
  const number = Number(value) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number)
}

async function print() {
  if (!props.transactionData) return

  const receiptData = {
    transactionId: props.transactionData.id.toString(),
    cashierName: props.transactionData.user?.username || 'N/A',
    items: props.transactionData.detailPenjualan.map((item) => ({
      name: item.barang.nama,
      quantity: item.jumlah,
      price: Number(item.hargaSatuan)
    })),
    total: Number(props.transactionData.total),
    // For reprint, we assume it was paid in full.
    payment: Number(props.transactionData.total),
    change: 0
  }

  await printReceipt(receiptData)
}

const onAfterLeave = () => {
  emit('onHide')
}

watch(
  () => props.show,
  (newVal) => {
    showDialog.value = newVal
    if (newVal) {
      console.log('Transaction Data:', props.transactionData)
    }
  }
)

watch(showDialog, (newVal) => {
  if (!newVal) emit('onHide')
})
</script>
