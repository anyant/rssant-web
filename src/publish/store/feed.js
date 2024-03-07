import { hamiVuex } from '@/store'
import API from '@/plugin/api'
import { fixTitle, normalizeFeedStoryOffset, sortFeedList } from '@/store/feed'
import Loading from '@/plugin/loading'
import Vue from 'vue'
import _ from 'lodash'

function normalizeFeed(feed) {
  let newFeed = {}
  Object.assign(newFeed, feed)
  newFeed = fixTitle(newFeed)
  newFeed = normalizeFeedStoryOffset(newFeed)
  return newFeed
}
export const publishFeedStore = hamiVuex.store({
  $name: 'publishFeed',
  $state() {
    return {
      loading: new Loading(),
      feedMap: {},
    }
  },
  get isLoading() {
    return this.loading.isLoading
  },
  get feedList() {
    return sortFeedList(Object.values(this.feedMap))
  },
  get(feedId) {
    return this.feedMap[feedId]
  },
  async doLoad() {
    await this.loading.begin(async () => {
      let result = await API.publish.feedQuery()
      let feedMap = {}
      result.feeds.forEach(feed => {
        feedMap[feed.id] = normalizeFeed(feed)
      })
      this.$patch({ feedMap, isLoaded: true })
    })
  },
  async doGet({ id, detail }) {
    let feed = await API.publish.feedGet({ id, detail })
    this.$patch(state => {
      Vue.set(state.feedMap, feed.id, feed)
    })
  },
  async doGetDetail({ id }) {
    let feed = this.get(id)
    if (!_.isNil(feed)) {
      if (feed.link || feed.encoding || feed.dt_checked) {
        return
      }
    }
    await this.doGet({ id, detail: true })
  },
})
