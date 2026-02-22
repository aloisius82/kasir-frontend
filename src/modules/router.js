import { createRouter, createWebHistory } from 'vue-router'
import generatedRoutes from '~pages'
import { setupLayouts } from 'virtual:generated-layouts'

// Progress bar on top of the page.
// Customize styles in @/styles/_progress-bar.css
import NProgress from 'nprogress'
import { useAppStore } from '../stores/appStore.js'
import component from 'vue3-simple-typeahead'

// console.log('Generated Routes: ', generatedRoutes)

const routes = [...setupLayouts(generatedRoutes)]
console.log('Final Routes: ', routes)

// const routes = [
//   { path: '/', component: () => import('../pages/homepage/index.vue') },
//   {path: '/pos', component: () => import('../pages/pos/Pos.vue')},
//   {path: '/barang', component: () => import('../pages/barang/Barang.vue')},
//   {path: '/tagihan', component: () => import('../pages/tagihan/Tagihan.vue')},
//   {path: '/laporan', component: () => import('../pages/laporan/Laporan.vue')}
// ]
const router = createRouter({
  history: createWebHistory(),

  /* Initial list of routes that should be added to the router.*/
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

router.beforeEach((to, from, next) => {
  NProgress.start()

  console.log('Navigating to: ', to.fullPath)

  const appStore = useAppStore()

  // Define public pages (routes that don't require authentication)
  const publicPages = ['/'] // Assuming '/' and '/homepage' are also public

  const authRequired = !publicPages.includes(to.path)
  const loggedIn = appStore.isLogin

  if (authRequired && !loggedIn) {
    // If trying to access a restricted page and not logged in, redirect to public homepage
    return next('/')
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

const install = (app) => app.use(router)

// Exporting router so Pinia can import it
// allowing router in store modules.
export { install, router }
