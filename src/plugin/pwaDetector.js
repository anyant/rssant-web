import UAParser from 'ua-parser-js'

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

export { hasPWA, isLikelySupportPWA }
