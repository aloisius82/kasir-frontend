<template>
  <VCol cols="12" sm="6" md="4">
    <v-card :variant="variant" :color="color">
      <v-card-title>Selamat Datang</v-card-title>

      <VCardActions> Ini ada sistem kasir Apotek Pilang </VCardActions>
    </v-card>
  </VCol>
</template>

<script setup>
import { ref } from 'vue'
import { VCardActions, VCol } from 'vuetify/lib/components/index.mjs'
import { useAppStore } from '@/stores/appStore'

const variant = ref('elevated')
const color = ref('indigo')
</script>
