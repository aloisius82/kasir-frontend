/*
 * General application related logic. */

import axios from 'axios'
import { menus } from './menus'
// import { head } from 'lodash-es'

const defaultOptionPost = {
  auth: true
}

const defaultOptionGet = {
  auth: true
}

const base_url = import.meta.env.VITE_API_URL

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
    pageTitle: '',
    globalSnackbar: {
      model: false,
      text: '',
      color: ''
    },
    array: [1, 2, 3],
    barangSearchParam: null,
    listBarang: []
  }),

  persist: {
    //Persist currentTheme, token, user, and role
    paths: ['currentTheme', 'token', 'user', 'role']
  },

  getters: {
    isDark: (state) => state.currentTheme === 'dark',
    isLogin: (state) => state.token !== null,
    getPageTitle: (state) => { 
    console.log('Getting page title:', state.pageTitle)  
      return state.pageTitle.value.length > 0 ? `Apotek Pilang - ${state.pageTitle}` : 'Apotek Pilang'
    }, 
    userName: (state) => {
      if (state.user && state.user.name) return state.user.name
      return 'Guest'
    },
    menus: (state) => {
      if (state.role == null || state.token == null) return []
      return menus[state.role]
    },
    todayLocalDateString: () => {
      const today = new Date()
      const offset = today.getTimezoneOffset()
      const localDate = new Date(today.getTime() - offset * 60 * 1000)
      return localDate.toISOString().substr(0, 10)
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
    setPageTitle(title) {
      this.pageTitle = title
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
      if (options.params) config.params = options.params
      return axios.get(fullURL(url), config).catch((error) => {
        console.log(error)
        throw error
      })
    },
    async axiosPost(url, data, options = defaultOptionPost) {
      url = fullURL(url)
      if (url == null) return { status: 404 }
      var headers = {
        'Content-Type': 'application/json',
        accept: '*/*'
      }
      if (options.auth && this.token != null) headers.Authorization = `Bearer ${this.token}`
      const config = {
        headers: headers
      }
      try {
        const response = await axios.post(url, data, config)
        return response
      } catch (error) {
        return { status: 404 }
      }
    },
    async axiosPut(url, data, options = defaultOptionPost) {
      url = fullURL(url)
      if (url == null) return { status: 404 }
      var headers = {
        'Content-Type': 'application/json',
        accept: '*/*'
      }
      if (options.auth && this.token != null) headers['Authorization'] = `Bearer ${this.token}`
      const config = {
        headers: headers
      }
      try {
        const response = await axios.put(url, data, config)
        return response
      } catch (error) {
        return { status: 404 }
      }
    },
    async axiosPatch(url, data, options = defaultOptionPost) {
      url = fullURL(url)
      if (url == null) return { status: 404 }
      var headers = {
        'Content-Type': 'application/json',
        accept: '*/*'
      }
      if (options.auth && this.token != null) headers['Authorization'] = `Bearer ${this.token}`
      const config = {
        headers: headers
      }
      try {
        const response = await axios.patch(url, data, config)
        return response
      } catch (error) {
        return { status: 404 }
      }
    },
    setAuthToken(token) {
      this.token = token
    },
    axiosDelete(url, options = defaultOptionPost) {
      url = fullURL(url)
      if (url == null) return { status: 404 }
      var headers = {
        'Content-Type': 'application/json',
        accept: '*/*'
      }
      if (options.auth && this.token != null) headers['Authorization'] = `Bearer ${this.token}`
      const config = {
        headers: headers
      }
      try {
        const response = axios.delete(url, config)
        return response
      } catch (error) {
        return { status: 404 }
      }
    },
    logout() {
      this.token = null
      this.user = null
      this.role = null
    }
  }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
