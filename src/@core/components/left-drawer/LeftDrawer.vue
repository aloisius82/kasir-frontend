<template>
  <VNavigationDrawer
    :rail="rail"
    color="drawer"
    elevation="7"
    expand-on-hover
    rail-width="55"
    width="260"
  >
    <VList nav>
      <div class="pa-2 mb-3 flex items-center justify-between">
        <RouterLink to="/">
          <VImg src="/company_logos/logo_apotek_pilang.jpeg" width="150">
            <template #placeholder>
              <div class="flex h-full items-center justify-center">
                <VProgressCircular color="grey-lighten-4" indeterminate />
              </div>
            </template>
          </VImg>
        </RouterLink>

        <div>
          <VIcon
            :icon="rail ? '$radioOff' : '$radioOn'"
            class="mt-n1 cursor-pointer"
            color="primary"
            size="small"
            @click="rail = !rail"
          />
        </div>
      </div>
      <VListItem
        v-ripple="false"
        color="primary"
        prepend-icon="$mdiHomeOutline"
        title="Dashboard"
        to="/"
      />
      <VListItem
        v-for="menu in menus"
        :key="menu.to"
        :prepend-icon="menu.icon || '$mdiHomeOutline'"
        :title="menu.title"
        :to="menu.to"
        v-ripple="false"
        color="primary"
      >
      </VListItem>
    </VList>
  </VNavigationDrawer>
</template>

<script setup>
const { menus } = toRefs(useAppStore())
const rail = ref(true)
</script>
