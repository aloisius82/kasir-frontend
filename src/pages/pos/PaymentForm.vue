<template>
  <VDialog v-model="showDialog" width="auto" @after-leave="onAfterLeave">
    <VCard :prepend-icon="mdiIcon.mdiCash" :title="props.title || 'Pembayaran'" width="500">
      <VCardText class="pa-5">
        <!-- Thermal Printer Section -->
        <div class="mb-4">
          <div class="d-flex align-center justify-space-between">
            <VBtn
              :loading="isLoading"
              :disabled="!!device"
              @click="connectToPrinter"
              size="small"
              variant="tonal"
            >
              <template v-if="!device">Hubungkan Printer</template>
              <template v-else>Terhubung: {{ device.name }}</template>
            </VBtn>
          </div>
          <VAlert v-if="error" type="error" density="compact" class="mt-2">{{ error }}</VAlert>
        </div>
        <VDivider class="mb-4"></VDivider>
        <!-- End Thermal Printer Section -->

        <VForm ref="paymentForm" lazy-validation>
          <VTextField label="Total" readonly>{{ props.total }}</VTextField>
          <VTextField
            v-model="paid"
            :readonly="selectedTipe.value != 'cash'"
            label="Bayar"
          ></VTextField>
          <VTextField v-if="selectedTipe.value == 'cash'" label="Kembalian" readonly>{{
            Kembalian
          }}</VTextField>
          <VCombobox
            v-model="selectedTipe"
            :items="tipePayments"
            :return-object="true"
            clearable
            item-title="label"
            item-value="value"
            label="Tipe Pembayaran"
            variant="outlined"
          >
          </VCombobox>
          <VTextField v-if="showRef" v-model="paymentRef" label="ref"> </VTextField>
          <div v-if="selectedTipe.value == 'cash'">
            <VBtn @click="addNominal(1000)">1.000</VBtn>
            <VBtn @click="addNominal(2000)">2.000</VBtn>
            <VBtn @click="addNominal(5000)">5.000</VBtn>
            <VBtn @click="addNominal(10000)">10.000</VBtn>
            <VBtn @click="addNominal(20000)">20.000</VBtn>
            <VBtn @click="addNominal(50000)">50.000</VBtn>
            <VBtn @click="addNominal(100000)">100.000</VBtn>
          </div>
          <VBtn @click="onCloseClick">close</VBtn>
          <VBtn @click="onCancelClick">cancel</VBtn>
          <VBtn
            class="ml-2 bayar-btn"
            :loading="isLoading"
            :disabled="paid < props.total"
            color="primary"
            @click="onPaidAndPrintThermalClick"
          >
            Bayar <span v-if="device">& Cetak Struk</span>
          </VBtn>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, watch, computed, getCurrentInstance } from 'vue'
import * as mdiIcon from '@mdi/js'
import { useAppStore } from '@/stores/appStore'
import { useThermalPrint } from '@/composables/useThermalPrint'

const props = defineProps({
  title: {
    type: String,
    default: 'Pembayaran'
  },
  show: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  },
  items: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['onHide', 'submit', 'onCancel'])

// Thermal Printer Composable
const { device, isLoading, error, connectToPrinter, printReceipt } = useThermalPrint()

const { proxy } = getCurrentInstance()

// const rules = {
//   required: (value) => !!value || 'This field is required',
//   email: (v) => /.+@.+\..+/.test(v) || 'Must be a valid email'
// }

const { axiosPost, snackbar } = useAppStore()
const { user } = toRefs(useAppStore())

const showDialog = ref(false)
const showRef = ref(false)
const selectedTipe = ref(null)
const status = ref(null)
const paymentRef = ref('')

const paid = ref(0)

const tipePayments = [
  { label: 'cash', value: 'cash', ref: false },
  { label: 'debit', value: 'debit', ref: true },
  { label: 'Kredit', value: 'credit', ref: true },
  { label: 'Transfer Bank', value: 'transfer', ref: true }
]

function onAfterLeave() {
  if (!status.value) emit('onHide', { status: 'hide' })
}

function addNominal(nominal) {
  paid.value += nominal
}

function onCloseClick() {
  status.value = null
  showDialog.value = false
}

// This function processes payment AND prints to thermal printer
async function onPaidAndPrintThermalClick() {
  status.value = 'paid'

  const postData = buildPostData()

  // First, post the transaction data to the backend
  axiosPost('/penjualan', postData, { auth: true }).then(async (res) => {
    console.log(res)

    // If backend post is successful, then print
    if (res) {
      const receiptData = {
        transactionId: res.data?.data?.id || 'N/A', // Assuming backend returns an ID
        cashierName: user.value,
        items: props.items.map((item) => ({
          name: item.nama,
          quantity: item.quantity,
          price: item.hargaSatuan
        })),
        total: props.total,
        payment: paid.value,
        change: Kembalian.value
      }
      console.log('Receipt Data:', receiptData)
      if (device.value) {
        await printReceipt(receiptData)
      } else {
        // console.log(printReceipt(receiptData))
        console.log(user.value + ' is the cashier')
        snackbar('Pembayaran berhasil', 'success')
      }
    } else {
      snackbar('Pembayaran gagal', 'error')
    }

    showDialog.value = false
    emit('onHide', { status: status.value })
  })
}

// This is the original payment function
function onPaidClick() {
  status.value = 'paid'

  const data = buildPostData()

  axiosPost('/penjualan', data, { auth: true }).then(async (res) => {
    console.log(res)
    try {
      // This uses the old html-to-paper method
      await proxy.$htmlToPaper('printMe')
    } catch (e) {
      console.error('Error printing:', e)
    } finally {
      showDialog.value = false
      emit('onHide', { status: status.value })
    }
  })
}

function buildPostData() {
  const data = {
    status: status.value,
    paymentType: selectedTipe.value.value,
    paymentRef: showRef.value ? paymentRef.value : null, // This should be replaced with actual ref if needed
    paid: paid.value,
    total: props.total,
    items: []
  }
  console.log('props.items', props.items)
  for (const item of props.items) {
    data.items.push({
      ...item,
      subtotal: item.hargaSatuan * item.quantity
    })
  }
  return data
}

function onCancelClick() {
  status.value = 'cancel'
  showDialog.value = false

  emit('onCancel', { status: status.value })
}

const Kembalian = computed(() => {
  if (selectedTipe.value && selectedTipe.value.value === 'cash') {
    return paid.value - props.total
  }
  return 0
})

watch(
  () => props.show,
  (newVal) => {
    showDialog.value = newVal
  }
)

// watch(
//   () => props.total,
//   (newVal) => {
//     showDialog.value = newVal
//   }
// )

watch(selectedTipe, (newVal) => {
  if (!newVal) return
  showRef.value = newVal.ref
  if (selectedTipe.value.ref === true) {
    paid.value = props.total
  } else {
    paid.value = 0
  }
})

watch(showDialog, (newVal) => {
  if (newVal) {
    showRef.value = false
    selectedTipe.value = tipePayments[0]
    status.value = null
    paid.value = 0
  }
})
</script>

<style scoped>
.bayar-btn.v-btn--disabled {
  background-color: #BDBDBD !important;
  color: #FFFFFF !important;
  cursor: not-allowed;
}
</style>
