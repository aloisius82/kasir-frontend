<template>
  <VRow class="p-4">
    <Public v-if="!appStore.isLogin" />
    <PenjualanHarian v-if="appStore.isLogin" />
    <Last7Days v-if="appStore.isLogin" />
  </VRow>
</template>
<script setup>
import { ref } from 'vue'
import { VCardActions, VRow, VCol } from 'vuetify/lib/components/index.mjs'
import { useAppStore } from '@/stores/appStore'

import PenjualanHarian from './PenjualanHarian.vue'
import Last7Days from './Last7Days.vue'
import Public from './Public.vue'

const appStore = useAppStore()
onMounted(() => {
  appStore.setPageTitle('Dashboard')
})
</script>
