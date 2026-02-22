<template>
  <VContainer fluid>
    <VRow>
      <VCol cols="6">
        <VTextField v-model="searchKey" label="Nama atau Kode Barang" clearable> </VTextField>
      </VCol>

      <VCol class="flex items-center" cols="auto">
        <VBtn color="primary" @click="clickFilter">Filter</VBtn>
      </VCol>
      <VCol class="flex items-center" cols="auto">
        <VBtn color="primary" to="/formbarang?id=new">New</VBtn>
      </VCol>
      <VCol class="flex items-center" cols="auto">
        <VBtn color="success" @click="exportToExcel">Export</VBtn>
      </VCol>
      <VCol class="flex items-center" cols="auto">
        <VBtn color="secondary" to="/formstockopname"> Stock Opname </VBtn>
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
          <template v-slot:item.id="{ item }">
            <div>
              <VBtn :to="`/formbarang?id=${item.columns.id}`" size="x-small" variant="text"
                >Edit
              </VBtn>
              <VBtn
                :icon="mdiIcon.mdiClose"
                size="x-small"
                @click="hapusBarang(item.raw.id)"
              ></VBtn>
            </div>
          </template>
        </VDataTableServer>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup>
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import * as mdiIcon from '@mdi/js'
import { useBarangStore } from '@/stores/barangStore'
import { storeToRefs } from 'pinia'
import { utils, writeFile } from 'xlsx'
// import { update } from 'lodash-es'

const { axiosGet, axiosDelete, snackbar } = useAppStore()
const barangStore = useBarangStore()
const { listBarang, searchKey } = storeToRefs(barangStore)

const headers = ref([
  { title: 'Nama Barang', key: 'nama' },
  { title: 'Barcode', key: 'barcode' },
  { title: 'Harga Satuan', key: 'hargaJual', align: 'end' },
  { title: 'Jumlah', key: 'qty', align: 'end' },
  { title: 'Penjualan', key: 'saleQty', align: 'end' },
  { title: 'action', key: 'id', align: 'end' }
])

const totalItems = ref(0)
const itemsPerPage = ref(10)

const clickFilter = () => {
  searchBarang()
}

const searchBarang = (page = 1) => {
  axiosGet('/barang/search', {
    params: { key: searchKey.value, num: itemsPerPage.value, page }
  }).then((response) => {
    if (response.status == 200) {
      barangStore.setListBarang(response.data.data)
      totalItems.value = response.data.total
      console.log(response.data)
    }
  })
}

const hapusBarang = (id) => {
  axiosDelete(`/barang/${id}`, { auth: true }).then((response) => {
    if (response.status == 200) {
      searchBarang()
      snackbar('Data berhasil dihapus.', 'success')
    } else {
      snackbar('Gagal menghapus data.', 'error')
    }
  })
}

const exportToExcel = () => {
  axiosGet('/barang/search', {
    params: { key: searchKey.value, num: totalItems.value, page: 1 }
  }).then((response) => {
    if (response.status == 200) {
      const data = response.data.data.map((item) => ({
        'Nama Barang': item.nama,
        Barcode: item.barcode,
        'Harga Satuan': item.hargaJual,
        Jumlah: item.qty,
        Penjualan: item.saleQty
      }))
      const ws = utils.json_to_sheet(data)
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'Barang')
      writeFile(wb, 'Daftar_Barang.xlsx')
    }
  })
}

const loadItems = ({ page }) => {
  searchBarang(page)
}

onMounted(() => {
  searchBarang()
})
</script>
