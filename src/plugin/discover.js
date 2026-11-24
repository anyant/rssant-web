const AUTO_ENTRY_KEY = 'RSSANT_DISCOVER_AUTO_ENTRY'

export function shouldAutoEnterDiscover() {
  return window.sessionStorage.getItem(AUTO_ENTRY_KEY) !== '1'
}

export function markDiscoverAutoEntered() {
  window.sessionStorage.setItem(AUTO_ENTRY_KEY, '1')
}

export function resetDiscoverAutoEntry() {
  window.sessionStorage.removeItem(AUTO_ENTRY_KEY)
}
