import _ from 'lodash'
import datefn from 'date-fns'

const FEEDS_STORAGE_KEY = 'RSSANT_FEEDS'
const FEEDS_TTL = 8 * 60 * 60

const localFeeds = (function() {
  const storage = window.localStorage
  const self = {
    enable: !_.isNil(storage),
    clear() {
      if (!self.enable) {
        return
      }
      storage.removeItem(FEEDS_STORAGE_KEY)
    },
    get() {
      if (!self.enable) {
        return []
      }
      let value = null
      let data = storage.getItem(FEEDS_STORAGE_KEY)
      if (_.isNil(data)) {
        return []
      }
      try {
        value = JSON.parse(data)
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.error('Load local feeds failed: ' + ex)
        self.clear()
        return []
      }
      let now = new Date()
      let expireAt = new Date(value.expireAt)
      if (_.isNil(expireAt || now >= expireAt)) {
        self.clear()
        return []
      }
      return _.defaultTo(value.feeds, [])
    },
    set(feeds) {
      if (!self.enable) {
        return
      }
      let now = new Date()
      let expireAt = datefn.addSeconds(now, FEEDS_TTL)
      let value = {
        feeds: feeds,
        expireAt: expireAt,
      }
      storage.setItem(FEEDS_STORAGE_KEY, JSON.stringify(value))
    },
  }
  return self
})()

export default localFeeds
