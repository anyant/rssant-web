import { hamiVuex } from '@/store'
import API from '@/plugin/api'
import { fixTitle, normalizeFeedStoryOffset, sortFeedList } from '@/store/feed'
import Loading from '@/plugin/loading'

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
  get(feedId){
    return this.feedMap[feedId]
  },
  async doLoad() {
    await this.loading.begin(async () => {
      let result = await API.publish.feedQuery()
      let feedMap = {}
      result.feeds.forEach(feed => {
        let newFeed = {}
        Object.assign(newFeed, feed)
        newFeed = fixTitle(newFeed)
        newFeed = normalizeFeedStoryOffset(newFeed)
        feedMap[feed.id] = newFeed
      })
      this.$patch({ feedMap, isLoaded: true })
    })
  },
})
