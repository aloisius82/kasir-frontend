<template>
  <VContainer>
    <VCard>
      <VCardTitle>Laporan Transaksi Harian</VCardTitle>
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" md="3">
            <VTextField
              v-model="date"
              type="date"
              label="Pilih Tanggal"
              density="compact"
              hide-details
            />
          </VCol>
          <VCol cols="12" md="auto">
            <VBtn color="primary" @click="fetchData" :loading="loading">Buat</VBtn>
            <VBtn color="success" class="ml-2" @click="exportToExcel" :disabled="!items.length"
              >Export Excel</VBtn
            >
          </VCol>
        </VRow>
        <VRow v-if="items.length > 0" class="mb1-2">
          <VCol v-for="kasir in kasirs" :key="kasir.username" cols="4"
            >{{ kasir.username }} - {{ formatCurrency(kasir.amount) }}
            <VTooltip activator="parent" location="bottom">{{ kasir.remark }}</VTooltip>
          </VCol>
          <VCol class="font-bold" cols="4"
            >Total: {{ formatCurrency(totalAmount) }}
            <VTooltip activator="parent" location="bottom">
              {{ remarkTotalPaymentType(amountPaymentType) }}
            </VTooltip>
          </VCol>
        </VRow>
        <VDataTable :headers="headers" :items="items" :items-per-page="10" :loading="loading">
          <template #item.createdAt="{ item }">
            {{ formatDate(item.raw.createdAt) }}
          </template>
          <template #item.total="{ item }">
            {{ formatCurrency(item.raw.total) }}
          </template>
          <template #item.actions="{ item }">
            <VBtn size="small" color="primary" variant="text" @click="showDetail(item)"
              >Detail</VBtn
            >
          </template>
        </VDataTable>
        <DetailTransaksi
          :show="showDetailDialog"
          :transactionData="selectedTransaction"
          @onHide="showDetailDialog = false"
        />
      </VCardText>
    </VCard>
  </VContainer>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
import { useAppStore } from '@/stores/appStore'
import DetailTransaksi from './DetailTransaksi.vue'
import { utils, writeFile } from 'xlsx'
import { VTooltip } from 'vuetify/lib/components/index.mjs'

const appStore = useAppStore()
const { axiosGet, snackbar } = appStore

const date = ref(appStore.todayLocalDateString)
const loading = ref(false)

const headers = [
  { title: 'ID Transaksi', key: 'id' },
  { title: 'Tanggal dan Jam', key: 'createdAt' },
  { title: 'Total', key: 'total' },
  { title: 'Kasir', key: 'user.username' },
  { title: 'Pembayaran', key: 'paymentType' },
  { title: 'Detail', key: 'actions', sortable: false }
]

const items = ref([])
const showDetailDialog = ref(false)
const selectedTransaction = ref(null)
const kasirs = ref([])
const totalAmount = ref(0)
const amountPaymentType = ref({ cash: 0, debit: 0, credit: 0, transfer: 0 })

function remarkTotalPaymentType(item) {
  let remark = ''
  if (item.cash > 0) remark += `Cash: ${formatCurrency(item.cash)} `
  if (item.debit > 0) remark += `Debit: ${formatCurrency(item.debit)} `
  if (item.credit > 0) remark += `Kredit: ${formatCurrency(item.credit)} `
  if (item.transfer > 0) remark += `Transfer: ${formatCurrency(item.transfer)}`
  return remark.trim()
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('id-ID')
}

function formatCurrency(value) {
  // Convert to number, default to 0 if conversion fails
  const number = Number(value) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number)
}

function fetchData() {
  loading.value = true
  axiosGet('/penjualan/transaksi-harian', {
    auth: true,
    params: { tanggal: date.value }
  })
    .then((response) => {
      if (response.status === 200) {
        items.value = response.data || []
        if (items.value.length === 0) {
          appStore.snackbar('Tidak ada transaksi untuk tanggal tersebut.', 'info')
        } else {
          const temp = {}
          items.value.forEach((item) => {
            if (item.user && item.user.username) {
              if (!temp[item.user.username]) {
                temp[item.user.username] = {
                  username: item.user.username,
                  amount: 0,
                  cash: 0,
                  debit: 0,
                  credit: 0,
                  transfer: 0
                }
              }
              temp[item.user.username].amount += Number(item.total) || 0
              temp[item.user.username][item.paymentType] += Number(item.total) || 0
            }
          })
          kasirs.value = []
          amountPaymentType.value = { cash: 0, debit: 0, credit: 0, transfer: 0, remark: '' }
          totalAmount.value = 0
          Object.keys(temp).forEach((key) => {
            totalAmount.value += temp[key].amount
            let remark = ''
            if (temp[key].cash > 0) remark += `Cash: ${formatCurrency(temp[key].cash)} `
            if (temp[key].debit > 0) remark += `Debit: ${formatCurrency(temp[key].debit)} `
            if (temp[key].credit > 0) remark += `Kredit: ${formatCurrency(temp[key].credit)} `
            if (temp[key].transfer > 0) remark += `Transfer: ${formatCurrency(temp[key].transfer)}`
            const tValue = { ...temp[key], remark: remark.trim() }
            kasirs.value.push(tValue)

            amountPaymentType.value['cash'] += temp[key].cash
            amountPaymentType.value['debit'] += temp[key].debit
            amountPaymentType.value['credit'] += temp[key].credit
            amountPaymentType.value['transfer'] += temp[key].transfer
          })

          snackbar('Laporan transaksi harian berhasil dibuat.', 'success')
        }
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function exportToExcel() {
  const data = items.value.map((item) => {
    const str = item.detailPenjualan.reduce((acc, value) => {
      const line = `${value.barang.nama} - ${value.jumlah} x ${formatCurrency(
        value.hargaSatuan
      )} = ${formatCurrency(value.subtotal)}`
      return acc ? `${acc}\n${line};` : `${line};`
    }, '')
    return {
      'ID Transaksi': item.id,
      Tanggal: formatDate(item.createdAt),
      Total: item.total,
      Kasir: item.user?.username || '-',
      Detail: str
    }
  })
  const ws = utils.json_to_sheet(data)
  for (let cell in ws) {
    if (cell.startsWith('D') && ws[cell].v) {
      ws[cell].s = { alignment: { wrapText: true } }
    }
  }
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, `Transaksi ${date.value}`)
  writeFile(wb, `Laporan_Transaksi_Harian_${date.value}.xlsx`)
}

function showDetail(item) {
  selectedTransaction.value = item.raw
  showDetailDialog.value = true
}

onMounted(fetchData)
</script>

<style scoped></style>
