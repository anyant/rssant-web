import _ from 'lodash'
import Vue from 'vue'
import { isAfter } from 'date-fns'
import Loading from '@/plugin/loading'
import { API } from '@/plugin/api'
import * as feedGroupHelper from '@/plugin/feedGroupHelper'
import { hamiVuex } from '.'
import { feedStore } from './feed'

function sortMushrooms(mushrooms) {
  return _.sortBy(mushrooms, [
    function(x) {
      return isReaded(x)
    },
    function(x) {
      return new Date(x.dt_published)
    },
    function(x) {
      return x.feed.id
    },
    'offset',
  ])
}

const MIN_STORYS_FOR_IMAGE_DEDUP = 10

function getLoadedStorysForImageDedup(storys, feedStorys) {
  let loadedStorys = []
  if (_.isEmpty(storys)) {
    return loadedStorys
  }
  let minOffset = _.minBy(storys, x => x.offset).offset
  for (let i = 0; i < MIN_STORYS_FOR_IMAGE_DEDUP - storys.length; i++) {
    let offset = minOffset - i - 1
    if (offset < 0) {
      break
    }
    let story = feedStorys[offset]
    if (!_.isNil(story)) {
      loadedStorys.push(story)
    }
  }
  return loadedStorys
}

function detectDuplicatedStoryImages(storys, feedStorys) {
  let total = 0
  let counts = {}
  let loadedStorys = getLoadedStorysForImageDedup(storys, feedStorys)
  for (let story of _.concat(storys, loadedStorys)) {
    if (!_.isEmpty(story.image_url)) {
      if (_.isNil(counts[story.image_url])) {
        counts[story.image_url] = 0
      }
      counts[story.image_url] += 1
      total += 1
    }
  }
  let threshold = Math.max(MIN_STORYS_FOR_IMAGE_DEDUP * 0.5, Math.min(MIN_STORYS_FOR_IMAGE_DEDUP, total * 0.5))
  for (let story of storys) {
    if (!_.isEmpty(story.image_url)) {
      if (counts[story.image_url] >= threshold) {
        story.is_image_duplicated = true
      }
    }
  }
  return storys
}

function addOrUpdateList(state, storys) {
  storys.forEach(story => {
    let feedStorys = state.storys[story.feed.id]
    if (_.isNil(feedStorys)) {
      Vue.set(state.storys, story.feed.id, {})
      feedStorys = state.storys[story.feed.id]
    }
    addOrUpdateStory(feedStorys, story)
  })
}

function addOrUpdateStory(feedStorys, story) {
  let updated = {}
  let old = feedStorys[story.offset]
  if (!_.isNil(old)) {
    Object.assign(updated, old)
  }
  _.forEach(_.entries(story), ([key, value]) => {
    if (!_.isNil(value) && value !== '') {
      updated[key] = value
    }
  })
  Vue.set(feedStorys, story.offset, updated)
}

function setFeedTotalStorysIfUpdated(feedId, storys) {
  let maxOffset = -1
  storys.forEach(story => {
    if (story.offset > maxOffset) {
      maxOffset = story.offset
    }
  })
  if (maxOffset >= 0) {
    feedStore.SET_TOTAL_STORYS_IF_UPDATED({ id: feedId, total: maxOffset + 1 })
  }
}

function isReaded(story) {
  let feed = feedStore.get(story.feed.id)
  if (_.isNil(feed)) {
    return false
  }
  return story.offset < feed.story_offset
}

function groupOfStory(storyKey) {
  let feed = feedStore.get(storyKey.feedId)
  return feedStore.groupOf(feed)
}

export const storyStore = hamiVuex.store({
  $name: 'story',
  $state() {
    return {
      nextStoryGetter: null,
      storys: {},
      mushroomKeys: [],
      loadedOffsetBegin: {}, // include
      loadedOffsetEnd: {}, // include
      mushroomsLoading: new Loading(),
      favoritedLoading: new Loading(),
    }
  },
  SET_FAVORITED({ feed_id, offset, is_favorited }) {
    this.$patch(state => {
      state.storys[feed_id][offset].is_favorited = is_favorited
    })
  },
  SET_WATCHED({ feed_id, offset, is_watched }) {
    this.$patch(state => {
      state.storys[feed_id][offset].is_watched = is_watched
    })
  },
  SET_NEXT_STORY_GETTER(getter) {
    this.$patch(state => {
      state.nextStoryGetter = getter
    })
  },
  ADD_OR_UPDATE(story) {
    this.$patch(state => {
      let feedStorys = state.storys[story.feed.id]
      if (_.isNil(feedStorys)) {
        Vue.set(state.storys, story.feed.id, {})
        feedStorys = state.storys[story.feed.id]
      }
      addOrUpdateStory(feedStorys, story)
    })
  },
  ADD_OR_UPDATE_LIST({ feedId, storys }) {
    this.$patch(state => {
      if (_.isEmpty(feedId)) {
        addOrUpdateList(state, storys)
      } else {
        let feedStorys = state.storys[feedId]
        if (_.isNil(feedStorys)) {
          Vue.set(state.storys, feedId, {})
          feedStorys = state.storys[feedId]
        }
        storys.forEach(story => {
          addOrUpdateStory(feedStorys, story)
        })
      }
    })
  },
  UPDATE_LOADED_OFFSET({ feedId, begin, end }) {
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
  RESET_LOADED_OFFSET(feedId) {
    this.$patch(state => {
      Vue.delete(state.loadedOffsetBegin, feedId)
      Vue.delete(state.loadedOffsetEnd, feedId)
    })
  },
  ADD_OR_UPDATE_MUSHROOMS(storys) {
    this.$patch(state => {
      addOrUpdateList(state, storys)
      state.mushroomKeys = storys.map(s => ({ feedId: s.feed.id, offset: s.offset }))
    })
  },
  DELETE_STORYS_OF_FEED(feedId) {
    this.$patch(state => {
      Vue.delete(state.storys, feedId)
      Vue.delete(state.loadedOffsetBegin, feedId)
      Vue.delete(state.loadedOffsetEnd, feedId)
      state.mushroomKeys = state.mushroomKeys.filter(x => {
        return x.feedId !== feedId
      })
    })
  },
  DELETE_STORYS_OF_ALL_FEED({ feedIds = null } = {}) {
    this.$patch(state => {
      if (_.isNil(feedIds)) {
        state.storys = {}
        state.mushroomKeys = []
        state.loadedOffsetBegin = {}
        state.loadedOffsetEnd = {}
        return
      }
      let feedIdsMap = {}
      feedIds.forEach(feedId => {
        feedIdsMap[feedId] = 1
      })
      feedIds.forEach(feedId => {
        Vue.delete(state.storys, feedId)
        Vue.delete(state.loadedOffsetBegin, feedId)
        Vue.delete(state.loadedOffsetEnd, feedId)
      })
      state.mushroomKeys = state.mushroomKeys.filter(x => {
        return _.isNil(feedIdsMap[x.feedId])
      })
    })
  },
  get({ feedId, offset }) {
    return _.defaultTo(this.storys[feedId], {})[offset]
  },
  getStoryListByKeys(keys) {
    return keys.map(key => this.get(key)).filter(x => !_.isNil(x))
  },
  getListByFeed(feedId) {
    let feedStorys = this.storys[feedId]
    if (_.isNil(feedStorys)) {
      return []
    }
    return _.sortBy(_.values(feedStorys), ['offset'])
  },
  mushroomsOfGroup(group) {
    let keys = _.filter(this.mushroomKeys, key => {
      return group === groupOfStory(key)
    })
    return this.getStoryListByKeys(keys)
  },
  get mushroomsOfHome() {
    let keys = _.filter(this.mushroomKeys, key => {
      return feedGroupHelper.isSystemGroup(groupOfStory(key))
    })
    return this.getStoryListByKeys(keys)
  },
  numUnreadOf(storys) {
    return storys.filter(story => !isReaded(story)).length
  },
  latestDateOf(storys) {
    let latest = null
    for (let story of storys) {
      let dt = new Date(story.dt_published)
      if (_.isNil(latest) || isAfter(dt, latest)) {
        latest = dt
      }
    }
    return latest
  },
  nextMushroomOf({ mushrooms, feedId, offset }) {
    let index = mushrooms.findIndex(story => {
      return story.feed.id === feedId && story.offset === offset
    })
    if (index >= 0 && index + 1 < mushrooms.length) {
      return mushrooms[index + 1]
    }
    return null
  },
  nextStoryInfo({ feedId, offset }) {
    let getter = this.nextStoryGetter
    return _.isNil(getter) ? {} : getter({ feedId, offset })
  },
  get favorited() {
    let favorited = []
    _.forEach(_.values(this.storys), feedStorys => {
      _.forEach(_.values(feedStorys), story => {
        if (story.is_favorited) {
          favorited.push(story)
        }
      })
    })
    return _.orderBy(favorited, ['dt_created', 'id'], ['desc', 'desc'])
  },
  isReaded(story) {
    return isReaded(story)
  },
  loadedOffset(feedId) {
    let begin = this.loadedOffsetBegin[feedId]
    // handle favorite storys
    while (!_.isNil(begin)) {
      if (_.isNil(this.storys[begin - 1])) {
        break
      }
      begin = begin - 1
    }
    let end = this.loadedOffsetEnd[feedId]
    // handle mushroom storys
    while (!_.isNil(end)) {
      if (_.isNil(this.storys[end + 1])) {
        break
      }
      end = end + 1
    }
    return { begin, end }
  },
  async setNextStoryGetter(getter) {
    this.SET_NEXT_STORY_GETTER(getter)
  },
  async setFavorited({ feedId, offset, is_favorited }) {
    await API.story.setFavorited({ feed_id: feedId, offset, is_favorited: is_favorited })
    this.SET_FAVORITED({ feed_id: feedId, offset, is_favorited })
  },
  async setWatched({ feedId, offset, is_watched }) {
    await API.story.setWatched({ feed_id: feedId, offset, is_watched: is_watched })
    this.SET_WATCHED({ feed_id: feedId, offset, is_watched })
  },
  async load({ feedId, offset, detail, setReaded }) {
    let story = await API.story.get({ feed_id: feedId, offset, detail, set_readed: setReaded })
    this.ADD_OR_UPDATE(story)
    if (setReaded) {
      feedStore.SET_STORY_OFFSET({ id: feedId, offset: offset + 1 })
    }
  },
  async loadList({ feedId, offset, detail, size, resetLoadedOffset, isInit }) {
    if (isInit) {
      // load at least N items to support image dedup
      let total = feedStore.get(feedId).total_storys
      offset = Math.max(0, Math.min(offset, total - MIN_STORYS_FOR_IMAGE_DEDUP))
      size = Math.max(size, MIN_STORYS_FOR_IMAGE_DEDUP)
    }
    let data = await API.story.query({ feed_id: feedId, offset, detail, size })
    if (resetLoadedOffset) {
      this.RESET_LOADED_OFFSET(feedId)
    }
    let feedStorys = _.defaultTo(this.storys[feedId], {})
    let storys = detectDuplicatedStoryImages(data.storys, feedStorys)
    this.ADD_OR_UPDATE_LIST({ feedId, storys: storys })
    this.UPDATE_LOADED_OFFSET({ feedId, begin: offset, end: offset + size - 1 })
    setFeedTotalStorysIfUpdated(feedId, storys)
  },
  async loadMushrooms({ mushroomKeys, detail }) {
    await this.mushroomsLoading.begin(async () => {
      let data = await API.story.queryBatch({ storys: mushroomKeys, detail })
      let mushrooms = sortMushrooms(data.storys)
      this.ADD_OR_UPDATE_MUSHROOMS(mushrooms)
    })
  },
  async loadFavorited() {
    await this.favoritedLoading.begin(async () => {
      let data = await API.story.listFavorited()
      this.ADD_OR_UPDATE_LIST({ storys: data.storys })
    })
  },
  async fetchFulltext({ feedId, offset }) {
    let result = await API.story.fetchFulltext({ feed_id: feedId, offset: offset })
    if (!_.isNil(result.story)) {
      this.ADD_OR_UPDATE(result.story)
    }
    return result
  },
})
