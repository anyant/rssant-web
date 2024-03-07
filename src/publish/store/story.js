import { hamiVuex } from '@/store'
import API from '@/plugin/api'
import Vue from 'vue'
import _ from 'lodash'
import { MIN_STORYS_FOR_IMAGE_DEDUP, addOrUpdateStory, detectDuplicatedStoryImages } from '@/store/story'
import { publishFeedStore } from '@/publish/store/feed'

export const publishStoryStore = hamiVuex.store({
  $name: 'publishStory',
  $state() {
    return {
      loadedOffsetBegin: {}, // include
      loadedOffsetEnd: {}, // include
      storyMap: {},
    }
  },
  get({ feedId, offset }) {
    return _.defaultTo(this.storyMap[feedId], {})[offset]
  },
  getListByFeed(feedId) {
    let feedStoryMap = this.storyMap[feedId]
    if (_.isNil(feedStoryMap)) {
      return []
    }
    return _.sortBy(_.values(feedStoryMap), ['offset'])
  },
  getLoadedOffset(feedId) {
    let begin = this.loadedOffsetBegin[feedId]
    let end = this.loadedOffsetEnd[feedId]
    return { begin, end }
  },
  async doLoad({ feedId, offset, detail }) {
    let story = await API.publish.storyGet({ feed_id: feedId, offset, detail })
    this._addOrUpdate(story)
  },
  async doLoadDetail({ feedId, offset }) {
    let story = this.get({ feedId, offset })
    if (!_.isNil(story)) {
      if (story.content) {
        return
      }
    }
    await this.doLoad({ feedId, offset, detail: true })
  },
  async doLoadList({ feedId, offset, detail, size, resetLoadedOffset, isInit }) {
    if (isInit) {
      // load at least N items to support image dedup
      let total = publishFeedStore.get(feedId).total_storys
      offset = Math.max(0, Math.min(offset, total - MIN_STORYS_FOR_IMAGE_DEDUP))
      size = Math.max(size, MIN_STORYS_FOR_IMAGE_DEDUP)
    }
    let data = await API.publish.storyQuery({ feed_id: feedId, offset, detail, size })
    if (resetLoadedOffset) {
      this._resetLoadedOffset(feedId)
    }
    let feedStoryMap = _.defaultTo(this.storyMap[feedId], {})
    let storys = detectDuplicatedStoryImages(data.storys, feedStoryMap)
    this._addOrUpdateList({ feedId, storys: storys })
    this._updateLoadedOffset({ feedId, begin: offset, end: offset + size - 1 })
  },
  _addOrUpdate(story) {
    this.$patch(state => {
      let feedStorys = state.storyMap[story.feed.id]
      if (_.isNil(feedStorys)) {
        Vue.set(state.storyMap, story.feed.id, {})
        feedStorys = state.storyMap[story.feed.id]
      }
      addOrUpdateStory(feedStorys, story)
    })
  },
  _resetLoadedOffset(feedId) {
    this.$patch(state => {
      Vue.delete(state.loadedOffsetBegin, feedId)
      Vue.delete(state.loadedOffsetEnd, feedId)
    })
  },
  _addOrUpdateList({ feedId, storys }) {
    this.$patch(state => {
      if (_.isEmpty(feedId)) {
        storys.forEach(story => {
          let feedStorys = state.storyMap[story.feed.id]
          if (_.isNil(feedStorys)) {
            Vue.set(state.storyMap, story.feed.id, {})
            feedStorys = state.storyMap[story.feed.id]
          }
          addOrUpdateStory(feedStorys, story)
        })
      } else {
        let feedStorys = state.storyMap[feedId]
        if (_.isNil(feedStorys)) {
          Vue.set(state.storyMap, feedId, {})
          feedStorys = state.storyMap[feedId]
        }
        storys.forEach(story => {
          addOrUpdateStory(feedStorys, story)
        })
      }
    })
  },
  _updateLoadedOffset({ feedId, begin, end }) {
    this.$patch(state => {
      let oldBegin = state.loadedOffsetBegin[feedId]
      if (_.isNil(oldBegin) || begin < oldBegin) {
        Vue.set(state.loadedOffsetBegin, feedId, begin)
      }
      let oldEnd = state.loadedOffsetEnd[feedId]
      if (_.isNil(oldEnd) || end > oldEnd) {
        Vue.set(state.loadedOffsetEnd, feedId, end)
      }
    })
  },
})
