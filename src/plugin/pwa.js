/* eslint-disable no-console */
import _ from 'lodash'
import UAParser from 'ua-parser-js'
import localConfig from '@/plugin/localConfig'
import { register } from 'register-service-worker'

const hasPWA = 'serviceWorker' in navigator

function isLikelySupportPWA() {
  if (!hasPWA) {
    return false
  }
  let ua = new UAParser(navigator.userAgent)
  let browser = ua.getBrowser().name
  let isSupport = /(Chrome|Chromium|Firefox|Edge|Safari|MIUI Browser)/i.test(browser)
  return isSupport
}

function registerServiceWorker() {
  if (!hasPWA || process.env.NODE_ENV !== 'production') {
    return
  }
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log('App is being served from cache by a service worker.')
    },
    registered() {
      console.log('Service worker has been registered.')
    },
    cached() {
      console.log('Content has been cached for offline use.')
    },
    updatefound() {
      console.log('New content is downloading.')
    },
    updated() {
      console.log('New content is available; please refresh.')
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.')
    },
    error(error) {
      console.error('Error during service worker registration:', error)
    },
  })
}

function unregisterServiceWorker() {
  if (!hasPWA) {
    return
  }
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister()
    }
  })
  if (!_.isNil(window.caches)) {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name)
      }
    })
  }
}

function checkUrlPWAEnable() {
  let search = _.defaultTo(location.search, '').toLowerCase()
  if (search.indexOf('pwa=1') >= 0) {
    return true
  }
  if (search.indexOf('pwa=0') >= 0) {
    return false
  }
  return null
}

function initPWA() {
  let isPWAEnable = checkUrlPWAEnable()
  if (_.isNil(isPWAEnable)) {
    isPWAEnable = localConfig.PWA_ENABLE.get()
  } else {
    localConfig.PWA_ENABLE.set(isPWAEnable)
  }
  if (isPWAEnable) {
    registerServiceWorker()
  } else {
    unregisterServiceWorker()
  }
}

export { hasPWA, isLikelySupportPWA, initPWA, registerServiceWorker, unregisterServiceWorker }
