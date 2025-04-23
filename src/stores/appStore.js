/*
 * General application related logic.
 */

import axios from 'axios'
import { menus } from './menus'
// import { head } from 'lodash-es'

const defaultOptionPost = {
  auth: true
}

const defaultOptionGet = {
  auth: true
}

const base_url = 'http://localhost:3000'

const fullURL = (url) => {
  if (isValidHttpUrl(url)) return url
  url = `${base_url}${url}`
  if (isValidHttpUrl(url)) return url
  return null
}

export const useAppStore = defineStore('global-application', {
  state: () => ({
    currentTheme: 'light',
    user: null,
    token: null,
    role: null,
    globalSnackbar: {
      model: false,
      text: '',
      color: ''
    },
    array: [1, 2, 3]
  }),

  persist: {
    //Persist only currentTheme
    paths: ['currentTheme']
  },

  getters: {
    isDark: (state) => state.currentTheme === 'dark',
    isLogin: (state) => state.token !== null,
    menus: (state) => {
      if (state.role == null || state.token == null) return []
      return menus[state.role]
    }
  },

  actions: {
    snackbar(text, type) {
      let color

      switch (type) {
        case 'error':
          // Vuetify error color (defined in theme)
          color = 'error'
          break

        default:
          // Vuetify primary color (defined in theme)
          color = 'primary'
          break
      }

      this.globalSnackbar = {
        model: true,
        text,
        color
      }
    },
    async axiosGet(url, options = defaultOptionGet) {
      url = fullURL(url)
      if (url == null) return { status: 404 }
      const headers = {
        'Content-Type': 'application/json',
        accept: '*/*'
      }
      if (options.auth && this.token != null) headers.Authorization = `Bearer ${this.token}`
      const config = { headers }
      if (options.data) config.param = options.data
      return axios.get(fullURL(url), config)
    },
    async axiosPost(url, data, options = defaultOptionPost) {
      url = fullURL(url)
      if (url == null) return { status: 404 }
      const headers = {
        'Content-Type': 'application/json',
        accept: '*/*'
      }
      if (options.auth && this.token != null) headers.Authorization = `Bearer ${this.token}`
      try {
        const response = await axios.post(url, data, headers)
        return response
      } catch (error) {
        return { status: 404 }
      }
    }
  }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
