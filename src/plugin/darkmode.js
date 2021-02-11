import * as DarkReader from 'darkreader'
import _ from 'lodash'

const HAS_STORAGE = !(window.localStorage === null || window.localStorage === undefined)
const IS_SUPPORT_DARK_MODE = (function() {
  // see also: https://web.dev/prefers-color-scheme/
  let match = window.matchMedia('(prefers-color-scheme)')
  return !(match.media === 'not all' || _.isNil(match.addEventListener))
})()

function normalizeMode(mode) {
  return mode === 'enable' || mode === 'disable' ? mode : 'auto'
}

function getDarkMode() {
  return normalizeMode(window.localStorage.getItem('RSSANT_DARK_MODE'))
}

function storeDarkMode(mode) {
  mode = normalizeMode(mode)
  if (mode === 'auto') {
    window.localStorage.removeItem('RSSANT_DARK_MODE')
  } else {
    window.localStorage.setItem('RSSANT_DARK_MODE', mode)
  }
}

const DARK_CONFIG = {
  brightness: 95,
  contrast: 95,
}

function applyDarkMode(method, config) {
  try {
    // https://github.com/darkreader/darkreader
    DarkReader[method](config)
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.warn(`DarkReader.${method} failed: ${ex}`)
  }
}

function initDarkMode() {
  if (!(HAS_STORAGE && IS_SUPPORT_DARK_MODE)) {
    // eslint-disable-next-line no-console
    console.log('Dark mode not supported!')
    return
  }
  let mode = getDarkMode()
  if (mode === 'enable') {
    applyDarkMode('enable', DARK_CONFIG)
  } else if (mode === 'auto') {
    applyDarkMode('auto', DARK_CONFIG)
  }
}

function setDarkMode(mode) {
  if (!(HAS_STORAGE && IS_SUPPORT_DARK_MODE)) {
    // eslint-disable-next-line no-console
    console.log('Dark mode not supported!')
    return
  }
  mode = normalizeMode(mode)
  let current = getDarkMode()
  if (mode === current) {
    return
  }
  storeDarkMode(mode)
  if (current === 'enable') {
    applyDarkMode('disable')
  }
  if (current === 'auto') {
    applyDarkMode('auto', false)
  }
  if (mode === 'enable') {
    applyDarkMode('enable')
  }
  if (mode === 'auto') {
    applyDarkMode('auto')
  }
}

export default {
  isSupported() {
    return HAS_STORAGE && IS_SUPPORT_DARK_MODE
  },
  get() {
    return getDarkMode()
  },
  set(mode) {
    return setDarkMode(mode)
  },
  init() {
    return initDarkMode()
  },
}
