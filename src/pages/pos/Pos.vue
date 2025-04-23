<template>
  <VContainer fluid>
    <VRow>
      <VCol cols="6">
        <VAutocomplete v-model="selectedBarang" :items="daftarBarang" item-title="nama" label="Cari Barang"
          return-object="true" @update:model-value="updateHarga"></VAutocomplete>
      </VCol>
      <VCol cols="1">
        <VTextField v-model.number="quantity" label="Jumlah"></VTextField>
      </VCol>
      <VCol cols="2">
        <VTextField v-model="hargaSatuan" label="Harga Satuan" readonly></VTextField>
      </VCol>
      <VCol cols="2">
        <VTextField v-model="subtotal" label="Subtotal" readonly></VTextField>
      </VCol>
      <VCol cols="1">
        <VBtn @click="tambahBarang">Tambah</VBtn>
      </VCol>
    </VRow>
    <VRow>
      <VCol cols="12">
        <VDataTable :headers="headers" :items="keranjang">
          <template v-slot:item.subtotal="{ item }">
            <div>{{ item.raw.quantity * item.raw.hargaSatuan }}</div>
          </template>
        </VDataTable>
      </VCol>
      <VCol cols="12">
        <PaymentForm :show="showPayment" @onHide="onHidePayment" />
      </VCol>
    </VRow>

    <VRow justify="end">
      <VCol cols="4">
        <VTextField v-model="total" label="Total" readonly></VTextField>
      </VCol>
    </VRow>
    <VRow justify="end">
      <VCol cols="2">
        <VBtn color="primary" @click="bayar">Bayar</VBtn>
      </VCol>
    </VRow>
  </VContainer>
</template>
<script setup>
import { forEach } from 'lodash-es'
import { ref, computed, watch } from 'vue'
// import TableData from '@/@core/components/table-data/TableData.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
import PaymentForm from './PaymentForm.vue'

const { axiosGet } = useAppStore()

const daftarBarang = ref([
  { id: 1, nama: 'Indomie Goreng', harga: 3000 },
  { id: 2, nama: 'Aqua 600ml', harga: 3500 },
  { id: 3, nama: 'Sabun Mandi Lux', harga: 5000 }
])
const selectedBarang = ref(null)
const quantity = ref(1)
const hargaSatuan = ref(0)
const keranjang = ref([])
const showPayment = ref(false)


const headers = ref([
  { title: 'Nama Barang', key: 'nama' },
  { title: 'Jumlah', key: 'quantity', align: 'end' },
  { title: 'Harga Satuan', key: 'hargaSatuan', align: 'end' },
  { title: 'Subtotal', key: 'subtotal', align: 'end' }
])

const total = ref(0)
const subtotal = computed(() => hargaSatuan.value * quantity.value)

function updateHarga() {
  if (selectedBarang.value) {
    hargaSatuan.value = selectedBarang.value.harga
  } else {
    hargaSatuan.value = 0
  }
}

function tambahBarang() {
  if (selectedBarang.value) {
    keranjang.value.push({
      id: selectedBarang.value.id,
      nama: selectedBarang.value.nama,
      quantity: quantity.value,
      hargaSatuan: hargaSatuan.value
    })
    total.value += subtotal.value
    selectedBarang.value = null
    quantity.value = 1
    hargaSatuan.value = 0
  }
}

function bayar() {

  showPayment.value = true
}

function onHidePayment(e) {
  showPayment.value = false
  switch (e.status) {
    case 'paid':
      keranjang.value = []
      total.value = 0
      break;
    case 'hide':

      break;
    default:
      break;
  }
}

watch(quantity, () => {
  subtotal.value = hargaSatuan.value * quantity.value
})

onMounted(() => {
  axiosGet('/barang').then((res) => {
    // console.log(res)
    if (res.status == 200) {
      const a = []
      forEach(res.data, (b) => {
        a.push({ id: b.id, nama: b.nama, harga: b.hargaJual })
      })
      daftarBarang.value = a
    }
  })
})
</script>
