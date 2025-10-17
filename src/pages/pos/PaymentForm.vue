<template>
  <VDialog v-model="showDialog" width="auto" @after-leave="onAfterLeave">
    <VCard :prepend-icon="mdiIcon.mdiCash" :title="props.title || 'Pembayaran'" width="500">
      <VCardText class="pa-5">
        <VForm ref="paymentForm" lazy-validation>
          <VTextField label="Total" readonly></VTextField>
          <VTextField label="Bayar"></VTextField>
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
          <VTextField v-if="showRef" label="ref"></VTextField>
          <VBtn @click="onCloseClick">close</VBtn>
          <VBtn @click="onPaidClick">bayar</VBtn>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import * as mdiIcon from '@mdi/js'
const props = defineProps({
  title: String,
  show: Boolean
})
const emit = defineEmits(['onHide', 'submit'])
const rules = {
  required: (value) => !!value || 'This field is required',
  email: (v) => /.+@.+\..+/.test(v) || 'Must be a valid email'
}

const showDialog = ref(false)
const showRef = ref(false)
const selectedTipe = ref(null)
const status = ref(null)

const tipePayments = [
  { label: 'cash', value: 'cash', ref: false },
  { label: 'debit', value: 'debit', ref: true },
  { label: 'Kredit', value: 'credit', ref: true }
]

function onAfterLeave() {
  if (!status.value) emit('onHide', { status: 'hide' })
}

function onCloseClick() {
  status.value = null
  showDialog.value = false
}

function onPaidClick() {
  status.value = 'paid'
  showDialog.value = false
  emit('onHide', { status: status.value })
}

watch(
  () => props.show,
  (newVal) => {
    showDialog.value = newVal
  }
)

watch(selectedTipe, (newVal) => {
  showRef.value = newVal.ref
})

watch(showDialog, (newVal) => {
  if (newVal) {
    showRef.value = false
    selectedTipe.value = tipePayments[0]
    status.value = null
  }
})
</script>
