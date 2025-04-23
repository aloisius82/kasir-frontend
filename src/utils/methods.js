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

function isValidHttpUrl(str) {
  const pattern = new RegExp(
    '^((http|https)://)?((([a-zd]([a-zd-]*[a-zd]).)+[a-z]{2,3}|d{1,3}.(d{1,3}.(d{1,3}.(d{1,3})))))(:d+)?(/[-a-zd%_.~]*)*?'
  )
  return pattern.test(str)
}

export { cloneDeep, isObject, capitalize, useDebouncedRef, isValidHttpUrl }
