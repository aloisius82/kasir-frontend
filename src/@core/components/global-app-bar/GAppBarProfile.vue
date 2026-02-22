<template>
  <div>
    <VBtn
      v-if="currentTheme === 'light'"
      color="white"
      icon="$mdiWeatherNight"
      variant="text"
      @click="currentTheme = 'dark'"
    />
    <VBtn
      v-else
      color="white"
      icon="$mdiWhiteBalanceSunny"
      variant="text"
      @click="currentTheme = 'light'"
    />
  </div>
</template>
<script setup>
import { ref } from 'vue'
import * as mdiIcon from '@mdi/js'

const store = useAppStore()
const { token, user, isLogin, role } = toRefs(store)
</script>
