import { defineStore } from 'pinia'

export const useBarangStore = defineStore('barang', {
  state: () => ({
    listBarang: [],
    searchKey: ''
  }),
  actions: {
    setListBarang(list) {
      this.listBarang = list
    },
    setSearchKey(key) {
      this.searchKey = key
    }
  }
})
