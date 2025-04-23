import * as mdiIcon from '@mdi/js'

export const menus = {
  quest: [],
  admin: [
    { title: 'POS', to: '/Pos', icon: mdiIcon.mdiDesktopClassic },
    { title: 'Barang', to: '/Barang', icon: mdiIcon.mdiWarehouse },
    { title: 'Tagihan', to: '/Tagihan', icon: mdiIcon.mdiFormatLetterCase },
    { title: 'Laporan', to: '/Laporan', icon: mdiIcon.mdiFile }
  ],
  kasir: [{ title: 'POS', to: '/Pos', icon: mdiIcon.mdiDesktopClassic }]
}
