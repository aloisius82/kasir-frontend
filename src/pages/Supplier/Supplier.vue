<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle>Data Supplier</VCardTitle>
          <VCardText>
            <VRow class="mb-2">
              <VCol cols="12" md="4">
                <VTextField
                  v-model="searchKey"
                  label="Cari Supplier"
                  density="compact"
                  hide-details
                  clearable
                  @click:clear="doSearch"
                  @keyup.enter="doSearch"
                ></VTextField>
              </VCol>
              <VCol cols="12" md="2">
                <VBtn color="primary" @click="doSearch">Cari</VBtn>
              </VCol>
              <VCol cols="12" md="2">
                <VBtn color="primary" to="/formsupplier?id=new">New</VBtn>
              </VCol>
            </VRow>
            <VDataTableServer
              v-model:items-per-page="itemsPerPage"
              :headers="headers"
              :items="serverItems"
              :items-length="totalItems"
              :loading="loading"
              item-value="id"
              @update:options="loadItems"
            >
              <template v-slot:item.nama="{ item }">
                <VBtn
                  size="x-small"
                  variant="text"
                  @click="
                    () => {
                      infoSupplierShow(item.raw)
                    }
                  "
                  >{{ item.raw.nama }}
                </VBtn>
              </template>
              <template v-slot:item.id="{ item }">
                <div>
                  <VBtn
                    :icon="mdiIcon.mdiPencil"
                    size="x-small"
                    variant="text"
                    @click="editSupplier(item.raw)"
                  ></VBtn>
                  <VBtn
                    :icon="mdiIcon.mdiClose"
                    size="x-small"
                    variant="text"
                    @click="deleteSupplier(item.raw)"
                  ></VBtn>
                </div>
              </template>
            </VDataTableServer>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import * as mdiIcon from '@mdi/js'
const { axiosGet } = useAppStore()

const itemsPerPage = ref(10)
const serverItems = ref([])
const totalItems = ref(0)
const loading = ref(false)
const searchKey = ref('')
const router = useRouter()

const headers = [
  { title: 'Nama', key: 'nama' },
  { title: 'PIC', key: 'pic' },
  { title: '', key: 'id' }
]

const editSupplier = (supplier) => {
  router.push(`/formsupplier?id=${supplier.id}`)
}

const deleteSupplier = (supplier) => {
  console.log('Delete supplier:', supplier)
}

const doSearch = () => {
  loadItems({ page: 1, itemsPerPage: itemsPerPage.value })
}

const infoSupplierShow = (supplier) => {
  console.log('Show info for supplier:', supplier)
}

async function loadItems({ page, itemsPerPage }) {
  loading.value = true
  try {
    const response = await axiosGet('/supplier/list', {
      params: { num: itemsPerPage, page, key: searchKey.value },
      auth: true
    })
    if (response.status == 200) {
      serverItems.value = response.data.data
      totalItems.value = response.data.total
    }
  } catch (error) {
    console.error('Error loading items:', error)
  } finally {
    loading.value = false
  }
}
</script>
