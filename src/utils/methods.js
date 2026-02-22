import { cloneDeep } from 'lodash-es'

function useDebouncedRef(value, delay = 200) {
  let timeout
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      }
    }
  })
}

function isObject(obj) {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
}

function capitalize(str) {
  if (!str) return
  return str[0].toUpperCase() + str.slice(1)
}

function isValidHttpUrl(url) {
  const regex =
    /^(https?:\/\/)(localhost|(\d{1,3}\.){3}\d{1,3}|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(:\d{1,5})?(\/[^\s]*)?$/
  return regex.test(url)
}

export { cloneDeep, isObject, capitalize, useDebouncedRef, isValidHttpUrl }
