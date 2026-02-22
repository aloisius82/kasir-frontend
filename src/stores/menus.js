import * as mdiIcon from '@mdi/js'

export const menus = {
  quest: [],
  admin: [
    { title: 'POS', to: '/Pos', icon: mdiIcon.mdiDesktopClassic },
    { title: 'Inventory', to: '/Barang', icon: mdiIcon.mdiWarehouse },
    { title: 'Supplier', to: '/Supplier', icon: mdiIcon.mdiTruck },
    { title: 'Tagihan', to: '/Tagihan', icon: mdiIcon.mdiFormatLetterCase },
    { title: 'Laporan', to: '/Laporan', icon: mdiIcon.mdiFile },
    { title: 'Users', to: '/usermanagement', icon: mdiIcon.mdiAccountGroup }
  ],
  kasir: [
    { title: 'POS', to: '/Pos', icon: mdiIcon.mdiDesktopClassic },
    { title: 'Inventory', to: '/Barang', icon: mdiIcon.mdiWarehouse },
    { title: 'Laporan', to: '/Laporan', icon: mdiIcon.mdiFile }
  ]
}
