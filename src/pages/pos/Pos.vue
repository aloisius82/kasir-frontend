<template>
  <VContainer fluid class="pos-container pa-md-3 pa-1">
    <VRow>
      <!-- Cart / Data Table -->
      <VCol cols="12" md="8" lg="8" order="2" order-md="1">
        <VCard class="fill-height">
          <VDataTable :headers="headers" :items="keranjang" class="fill-height">
            <template #item.id="{ item }">
              <VBtn
                :icon="mdiIcon.mdiDelete"
                variant="text"
                size="small"
                @click="hapusBarang(item.columns.id)"
              />
            </template>
            <template #item.quantity="{ item }">
              <VTextField
                v-model.number="item.columns.quantity"
                type="number"
                style="width: 100px"
                density="compact"
                hide-details
                @update:model-value="(newQty) => onQtyChange(newQty, item.columns.id)"
              />
            </template>
            <template #item.subtotal="{ item }">
              {{ formatCurrency(item.columns.quantity * item.columns.hargaSatuan) }}
            </template>
            <template #item.hargaSatuan="{ item }">
              {{ formatCurrency(item.columns.hargaSatuan) }}
            </template>
            <template #bottom>
              <div v-if="keranjang.length === 0" class="text-center pa-10">
                <VIcon size="60" class="text-disabled mb-4">{{ mdiIcon.mdiCartOutline }}</VIcon>
                <p class="text-disabled">Keranjang Anda kosong</p>
              </div>
            </template>
          </VDataTable>
        </VCard>
      </VCol>

      <!-- Controls -->
      <VCol cols="12" md="4" lg="4" order="1" order-md="2">
        <VCard>
          <VCardText>
            <VAutocomplete
              ref="autocomplete"
              v-model="selectedBarang"
              v-model:search="searchTerm"
              :items="filteredItems"
              autofocus
              item-title="nama"
              label="Scan atau cari barang..."
              return-object
              clearable
              @keyup.enter.prevent="onKeyup"
              @update:focused="onFocused"
              @update:model-value="onUpdatedModelValue"
              class="mb-4"
              hide-details
              density="comfortable"
              variant="solo-filled"
            >
              <template #item="{ props, item }">
                <VListItem v-bind="props">
                  <template #title>
                    <span v-html="highlightText(item.raw.nama, searchTerm)"></span>
                  </template>
                  <template #append>
                    <span class="text-grey">{{ formatCurrency(item.raw.harga) }}</span>
                  </template>
                </VListItem>
              </template>
            </VAutocomplete>
            <VRow>
              <VCol cols="4">
                <VTextField
                  ref="quantityInput"
                  v-model.number="quantity"
                  density="compact"
                  hide-details
                  label="Jumlah"
                  type="number"
                  @keyup.enter.prevent="tambahBarang"
                />
              </VCol>
              <VCol cols="8">
                <VTextField
                  v-model="formattedHargaSatuan"
                  hide-details
                  label="Harga Satuan"
                  readonly
                  density="compact"
                />
              </VCol>
            </VRow>
          </VCardText>
          <VCardActions>
            <VBtn color="primary" block large @click="tambahBarang">
              <VIcon left>{{ mdiIcon.mdiCartPlus }}</VIcon>
              Tambah ke Keranjang
            </VBtn>
          </VCardActions>

          <VDivider class="my-4" />

          <VCardText>
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-h5">Total</span>
              <span class="text-h5 font-weight-bold">{{ formattedTotal }}</span>
            </div>
          </VCardText>

          <VCardActions class="pa-4">
            <VBtn
              :disabled="keranjang.length === 0"
              block
              color="success"
              size="x-large"
              @click="bayar"
            >
              <VIcon start="">{{ mdiIcon.mdiCashRegister }}</VIcon>
              Bayar
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>

    <!-- Payment Dialog -->
    <PaymentForm :items="keranjang" :show="showPayment" :total="total" @onHide="onHidePayment" />
  </VContainer>
</template>
<script setup>
import { debounce, forEach } from 'lodash-es'
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
// import TableData from '@/@core/components/table-data/TableData.vue'
import { VDataTable } from 'vuetify/labs/VDataTable'
import PaymentForm from './PaymentForm.vue'
import { useAppStore } from '@/stores/appStore'
import * as mdiIcon from '@mdi/js'

const autocomplete = ref(null)
const quantityInput = ref(null)
const { axiosGet, snackbar } = useAppStore()

const isBarcode = ref(false)

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

const payment = ref(0)

const headers = ref([
  { title: 'Nama Barang', key: 'nama' },
  { title: 'Jumlah', key: 'quantity', align: 'end', width: '100' },
  { title: 'Harga Satuan', key: 'hargaSatuan', align: 'end' },
  { title: 'Subtotal', key: 'subtotal', align: 'end' },
  { title: 'Actions', key: 'id', sortable: false, align: 'end' }
])

const searchTerm = ref('')

const total = ref(0)
// const subtotal = computed(() => hargaSatuan.value * quantity.value)

const formatCurrency = (value) => {
  if (isNaN(value)) return value
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const formattedHargaSatuan = computed(() => formatCurrency(hargaSatuan.value))
const formattedTotal = computed(() => formatCurrency(total.value))

const filteredItems = ref([])

const findItems = (query) => {
  isBarcode.value = false

  const lQuery = query.toLowerCase()
  console.log('Filtering items for query:', query)
  // console.log(daftarBarang.value)
  // First, try for an exact match on barcode, name or ID (for barcode scanner)

  const exactMatch = daftarBarang.value.find(
    (barang) => barang.barcode === query || barang.nama.toLowerCase() === lQuery
  )
  if (exactMatch) {
    filteredItems.value = [exactMatch]
    isBarcode.value = true
    return
  }

  // If no exact match, perform a contains search for manual typing, if query is long enough
  const results = daftarBarang.value.filter((barang) => {
    return barang.nama
      .toLowerCase()
      .split(' ')
      .some((word) => word.startsWith(lQuery))
  })
  filteredItems.value = results
}

const debouncedFindItems = debounce(findItems, 300)

watch(searchTerm, (newVal) => {
  if (selectedBarang.value) return
  const query = newVal ? newVal.trim() : ''

  // Barcode scanner optimization: Check for an exact barcode match immediately.
  const exactMatch = daftarBarang.value.find((barang) => barang.barcode === query)
  console.log('Search term changed to:', query, 'Exact match:', exactMatch)
  if (exactMatch && query.length >= 3) {
    // Found an exact barcode match, likely from a scanner.
    // Cancel any pending debounced search.
    debouncedFindItems.cancel()
    // Select the item and add it to the cart immediately.
    selectedBarang.value = exactMatch
    tambahBarang()
    // The `tambahBarang` function will clear the search term and reset the state.
    return
  }

  // If no exact barcode match, proceed with debounced search for manual typing.
  if (query.length < 2) {
    debouncedFindItems.cancel()
    filteredItems.value = []
  } else {
    debouncedFindItems(query)
  }
})

const onFocused = (focused) => {
  if (!focused) {
    // searchTerm.value = ''
  }
}

const onKeyup = () => {
  if (isBarcode.value) {
    console.log('Barcode detected, adding item directly')
    nextTick(() => {
      if (filteredItems.value.length === 1) {
        selectedBarang.value = filteredItems.value[0]
      }
      tambahBarang()
    })
  }
  console.log('go to quantity input field')
  quantityInput.value?.focus()
  return
}

function highlightText(text, query) {
  if (!query) {
    return text
  }
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) {
    return text
  }

  const words = text.split(' ')
  const processedWords = words.map((word) => {
    if (word.toLowerCase().startsWith(lowerQuery)) {
      const matchPart = word.substring(0, lowerQuery.length)
      const restPart = word.substring(lowerQuery.length)
      return `<strong>${matchPart}</strong>${restPart}`
    } else {
      return word
    }
  })

  return processedWords.join(' ')
}

function onUpdatedModelValue(value) {
  console.log('Selected barang changed:', value)
  hargaSatuan.value = selectedBarang.value.harga
}

function tambahBarang() {
  if (selectedBarang.value) {
    var index = -1
    for (let i = 0; i < keranjang.value.length; i++) {
      if (keranjang.value[i].id === selectedBarang.value.id) {
        index = i
        break
      }
    }
    if (index !== -1) {
      keranjang.value[index].quantity += quantity.value
      snackbar('Jumlah barang diperbarui di keranjang', 'success')
    } else {
      keranjang.value.unshift({
        id: selectedBarang.value.id,
        nama: selectedBarang.value.nama,
        quantity: quantity.value,
        hargaSatuan: selectedBarang.value.harga
      })
      snackbar('Barang ditambahkan ke keranjang', 'success')
    }
    selectedBarang.value = null
    quantity.value = 1
    hargaSatuan.value = 0
    searchTerm.value = ''
    nextTick(() => {
      autocomplete.value.focus()
    })
  }
}

function hapusBarang(itemId) {
  const index = keranjang.value.findIndex((i) => i.id === itemId)
  console.log(index)
  if (index !== -1) {
    keranjang.value.splice(index, 1)
  }
}

function bayar() {
  console.log('Bayar clicked')
  if (keranjang.value.length === 0) {
    alert('Keranjang kosong!')
    return
  }
  payment.value = total.value
  showPayment.value = true
}

function onHidePayment(e) {
  showPayment.value = false
  switch (e.status) {
    case 'paid':
      keranjang.value = []
      total.value = 0
      break
    case 'hide':
      break
    default:
      break
  }
}

const onQtyChange = (newQty, itemId) => {
  const index = keranjang.value.findIndex((i) => i.id === itemId)
  if (index !== -1) {
    keranjang.value[index].quantity = newQty
  }
}

watch(
  keranjang,
  (newValue) => {
    let newTotal = 0
    newValue.forEach((item) => {
      newTotal += item.quantity * item.hargaSatuan
    })
    total.value = newTotal
  },
  { deep: true }
)

// watch(quantity, () => {
//   subtotal.value = hargaSatuan.value * quantity.value
// })

let updateInterval = null

const updateItems = () => {
  axiosGet('/barang').then((res) => {
    // console.log(res)
    if (res.status == 200) {
      const a = []
      forEach(res.data, (b) => {
        a.push({ id: b.id, nama: b.nama, harga: b.hargaJual, barcode: b.barcode })
      })
      daftarBarang.value = a
    }
  })
}

onMounted(() => {
  updateItems()
  updateInterval = setInterval(updateItems, 300000) // 5 menit
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>
