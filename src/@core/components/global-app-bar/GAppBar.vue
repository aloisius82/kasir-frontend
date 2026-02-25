<template>
  <VAppBar :title="getPageTitle" color="appbar-background" elevation="15" height="62">
    <GAppBarMenuRight />
  </VAppBar>
</template>

<script setup>
const { getPageTitle } = useAppStore()
</script>
