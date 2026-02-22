// src/composables/useThermalPrint.js
import { ref } from 'vue'
import EscPosEncoder from 'esc-pos-encoder'

// Store device instance to reuse connection
const device = ref(null)
const characteristic = ref(null)
const isLoading = ref(false)
const error = ref(null)
const logs = ref([])

// UUID Standar untuk banyak printer thermal China (termasuk Iware/ZJ) dengan chipset ISSC
const PRINTER_SERVICE_UUID = '49535343-fe7d-4ae5-8fa9-9fafd205e455'
// UUID Characteristic untuk menulis data (Write)
const PRINTER_CHARACTERISTIC_UUID = '49535343-8841-43f4-a8d4-ecbe34729bb3'

export function useThermalPrint() {
  /**
   * Scans for a Bluetooth printer and connects to it.
   * Stores the connection for later use.
   */
  async function connectToPrinter() {
    isLoading.value = true
    error.value = null
    logs.value = []
    try {
      console.log('Mencari perangkat...')
      logs.value.push('Mencari perangkat...\n')
      // 1. Request perangkat Bluetooth
      const bluetoothDevice = await navigator.bluetooth.requestDevice({
        // filters: [
        //   { services: [PRINTER_SERVICE_UUID] }
        // ],
        acceptAllDevices: true,
        optionalServices: [PRINTER_SERVICE_UUID]
      })
      device.value = bluetoothDevice

      console.log('Menghubungkan ke GATT Server...')
      logs.value.push('Menghubungkan ke GATT Server...\n')
      const server = await bluetoothDevice.gatt.connect()

      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log('Mendapatkan Service...')
      logs.value.push('Mendapatkan Service...\n')
      const service = await server.getPrimaryService(PRINTER_SERVICE_UUID)

      console.log('Mendapatkan Characteristic...')
      logs.value.push('Mendapatkan Characteristic...\n')
      characteristic.value = await service.getCharacteristic(PRINTER_CHARACTERISTIC_UUID)

      console.log('Printer terhubung!')
      logs.value.push('Printer terhubung!\n')

      // 2. Siapkan data yang akan diprint (Format ESC/POS)
      // \n adalah ganti baris, \x1b\x40 adalah inisialisasi printer
      const text = '\x1b\x40' + 'Succes\n' + 'Tes Print \n' + '----------------------\n\n\n'
      const encoder = new TextEncoder()
      const data = encoder.encode(text)

      // 3. Kirim data ke printer
      console.log('Mengirim data print...')
      logs.value.push('Mengirim data print...\n')
      await characteristic.value.writeValue(data)

      console.log('Selesai!')
      logs.value.push('Selesai!\n')
    } catch (e) {
      console.error('Failed to connect to printer', e)
      error.value =
        'Gagal terhubung ke printer. Pastikan Bluetooth aktif dan printer dalam jangkauan.' +
        e.errorMessage
      device.value = null
      characteristic.value = null
      logs.value.push(`Error: ${error.value}\n`)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Prints a formatted receipt to the connected printer.
   * @param {object} data - The receipt data.
   * @param {string} data.transactionId - The transaction ID.
   * @param {Array<{name: string, quantity: number, price: number}>} data.items - The items purchased.
   * @param {number} data.total - The total amount.
   * @param {number} data.payment - The payment amount.
   * @param {number} data.change - The change amount.
   */
  async function printReceipt(data) {
    logs.value = []
    if (!device.value || !characteristic.value) {
      error.value = 'Printer tidak terhubung. Silakan hubungkan terlebih dahulu.'
      console.error('Printer not connected')
      logs.value.push('Printer not connected\n')
      return
    }

    console.log('Mengirim struk...')
    logs.value.push('Mengirim struk...\n')

    isLoading.value = true
    error.value = null

    try {
      const encoder = new EscPosEncoder()
      logs.value.push('Membuat format struk...\n')

      // Header
      encoder
        .initialize()
        .newline()
        .newline()
        .align('center')
        .bold(true)
        .line('Apotek Pilang')
        .bold(false)
        .line('Jl. Pilang Raya No.110')
        .line('--------------------------------')
        .align('left')
        .text('No. Transaksi: ')
        .text(data.transactionId)
        .newline()
        .text('Tanggal: ')
        .text(new Date().toLocaleString('id-ID'))
      if (data.cashierName) {
        encoder.newline().text('Kasir: ').text(data.cashierName).newline()
      }
      encoder.newline().line('--------------------------------')

      logs.value.push('Menambahkan item ke struk...\n')

      // Items - using a table for alignment
      // const itemRows = data.items.map((item) => {
      //   const itemTotal = item.quantity * item.price
      //   // // Truncate name if it's too long for the column
      //   const itemName = item.name.length > 15 ? `${item.name.substring(0, 14)}.` : item.name
      //   return [itemName, `x${item.quantity}`, formatCurrency(itemTotal)]
      //   // return [itemName, `x${item.quantity}`, formatCurrency(item.price)]
      // })

      const itemRows = []

      console.log(itemRows)
      logs.value.push(`generate item row\n`)
      for (const item of data.items) {
        const itemTotal = item.quantity * item.price
        // // Truncate name if it's too long for the column
        const itemName = item.name.length > 15 ? `${item.name.substring(0, 14)}.` : item.name
        itemRows.push([itemName, `x${item.quantity}`, formatCurrency(itemTotal)])
        // logs.value.push(`Added item row: ${itemName}, x${item.quantity}, ${formatCurrency(itemTotal)}\n`)
        logs.value.push('adding item row...\n')
      }

      console.log(itemRows)
      logs.value.push(`generate item row finish\n`)

      encoder.table(
        [
          { width: 16, align: 'left' },
          { width: 4, align: 'center' },
          { width: 12, align: 'right' }
        ],
        itemRows
      )

      // Footer
      encoder
        .line('--------------------------------')
        .align('right')
        .bold(true)
        .line(`Total: ${formatCurrency(data.total)}`)
        .line(`Bayar: ${formatCurrency(data.payment)}`)
        .line(`Kembali: ${formatCurrency(data.change)}`)
        .bold(false)
        .line('--------------------------------')
        .align('center')
        .line('Terima kasih telah berbelanja!')
        .newline()
        .newline()
        .newline()
        .cut()

      const result = encoder.encode()

      console.log(result)
      // Send data in chunks if necessary
      const maxChunkSize = 100 // Some printers have small buffer sizes
      for (let i = 0; i < result.length; i += maxChunkSize) {
        const chunk = result.subarray(i, i + maxChunkSize)
        await characteristic.value.writeValueWithoutResponse(chunk)
      }
    } catch (e) {
      console.error('Failed to print receipt', e)
      error.value = 'Gagal mencetak struk. Terjadi kesalahan saat mengirim data.'
      logs.value.push(`Error: ${error.value}\n`)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Formats a number as IDR currency.
   * @param {number} value - The number to format.
   * @returns {string} - The formatted currency string.
   */
  function formatCurrency(value) {
    // const res = new Intl.NumberFormat('id-ID', {
    //   style: 'currency',
    //   currency: 'IDR',
    //   minimumFractionDigits: 0
    // }).format(value)
    const res = `Rp.${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
    return res.replaceAll('.00', '').replaceAll('?', '')
  }

  return {
    device,
    isLoading,
    error,
    connectToPrinter,
    printReceipt,
    logs
  }
}
