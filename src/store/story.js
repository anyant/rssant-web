import _ from 'lodash'
import Vue from 'vue'
import { isAfter } from 'date-fns'
import Loading from '@/plugin/loading'
import { API } from '@/plugin/api'
import * as feedGroupHelper from '@/plugin/feedGroupHelper'

function sortMushrooms(mushrooms, API) {
  return _.sortBy(mushrooms, [
    function(x) {
      return API.story.isReaded(x)
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

function setFeedTotalStorysIfUpdated(DAO, feedId, storys) {
  let maxOffset = -1
  storys.forEach(story => {
    if (story.offset > maxOffset) {
      maxOffset = story.offset
    }
  })
  if (maxOffset >= 0) {
    DAO.API.feed.SET_TOTAL_STORYS_IF_UPDATED({ id: feedId, total: maxOffset + 1 })
  }
}

function isReaded(API, story) {
  let feed = API.feed.get(story.feed.id)
  if (_.isNil(feed)) {
    return false
  }
  return story.offset < feed.story_offset
}

function groupOfStory(API, storyKey) {
  let feed = API.feed.get(storyKey.feedId)
  return API.feed.groupOf(feed)
}

function getStory(state, { feedId, offset }) {
  return _.defaultTo(state.storys[feedId], {})[offset]
}

function getStoryListByKeys(state, keys) {
  return keys.map(key => getStory(state, key)).filter(x => !_.isNil(x))
}

export default {
  state: {
    nextStoryGetter: null,
    storys: {},
    mushroomKeys: [],
    loadedOffsetBegin: {}, // include
    loadedOffsetEnd: {}, // include
    mushroomsLoading: new Loading(),
    favoritedLoading: new Loading(),
  },
  mutations: {
    SET_FAVORITED(state, { feed_id, offset, is_favorited }) {
      state.storys[feed_id][offset].is_favorited = is_favorited
    },
    SET_WATCHED(state, { feed_id, offset, is_watched }) {
      state.storys[feed_id][offset].is_watched = is_watched
    },
    SET_NEXT_STORY_GETTER(state, getter) {
      state.nextStoryGetter = getter
    },
    ADD_OR_UPDATE(state, story) {
      let feedStorys = state.storys[story.feed.id]
      if (_.isNil(feedStorys)) {
        Vue.set(state.storys, story.feed.id, {})
        feedStorys = state.storys[story.feed.id]
      }
      addOrUpdateStory(feedStorys, story)
    },
    ADD_OR_UPDATE_LIST(state, { feedId, storys }) {
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
    },
    UPDATE_LOADED_OFFSET(state, { feedId, begin, end }) {
      let oldBegin = state.loadedOffsetBegin[feedId]
      if (_.isNil(oldBegin) || begin < oldBegin) {
        Vue.set(state.loadedOffsetBegin, feedId, begin)
      }
      let oldEnd = state.loadedOffsetEnd[feedId]
      if (_.isNil(oldEnd) || end > oldEnd) {
        Vue.set(state.loadedOffsetEnd, feedId, end)
      }
    },
    RESET_LOADED_OFFSET(state, feedId) {
      Vue.delete(state.loadedOffsetBegin, feedId)
      Vue.delete(state.loadedOffsetEnd, feedId)
    },
    ADD_OR_UPDATE_MUSHROOMS(state, storys) {
      addOrUpdateList(state, storys)
      state.mushroomKeys = storys.map(s => ({ feedId: s.feed.id, offset: s.offset }))
    },
    DELETE_STORYS_OF_FEED(state, feedId) {
      Vue.delete(state.storys, feedId)
      Vue.delete(state.loadedOffsetBegin, feedId)
      Vue.delete(state.loadedOffsetEnd, feedId)
      state.mushroomKeys = state.mushroomKeys.filter(x => {
        return x.feedId !== feedId
      })
    },
    DELETE_STORYS_OF_ALL_FEED(state, { feedIds = null } = {}) {
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
    },
  },
  getters: {
    get(state) {
      return ({ feedId, offset }) => getStory(state, { feedId, offset })
    },
    getListByFeed(state) {
      return feedId => {
        let feedStorys = state.storys[feedId]
        if (_.isNil(feedStorys)) {
          return []
        }
        return _.sortBy(_.values(feedStorys), ['offset'])
      }
    },
    mushroomsOfGroup(state, API) {
      return group => {
        let keys = _.filter(state.mushroomKeys, key => {
          return group === groupOfStory(API, key)
        })
        return getStoryListByKeys(state, keys)
      }
    },
    mushroomsOfHome(state, API) {
      let keys = _.filter(state.mushroomKeys, key => {
        return feedGroupHelper.isSystemGroup(groupOfStory(API, key))
      })
      return getStoryListByKeys(state, keys)
    },
    numUnreadOf(state, API) {
      return storys => storys.filter(story => !isReaded(API, story)).length
    },
    latestDateOf(state) {
      return storys => {
        let latest = null
        for (let story of storys) {
          let dt = new Date(story.dt_published)
          if (_.isNil(latest) || isAfter(dt, latest)) {
            latest = dt
          }
        }
        return latest
      }
    },
    nextMushroomOf(state) {
      return ({ mushrooms, feedId, offset }) => {
        let index = mushrooms.findIndex(story => {
          return story.feed.id === feedId && story.offset === offset
        })
        if (index >= 0 && index + 1 < mushrooms.length) {
          return mushrooms[index + 1]
        }
        return null
      }
    },
    nextStoryInfo(state) {
      return ({ feedId, offset }) => {
        let getter = state.nextStoryGetter
        return _.isNil(getter) ? {} : getter({ feedId, offset })
      }
    },
    favorited(state) {
      let favorited = []
      _.forEach(_.values(state.storys), feedStorys => {
        _.forEach(_.values(feedStorys), story => {
          if (story.is_favorited) {
            favorited.push(story)
          }
        })
      })
      return _.orderBy(favorited, ['dt_created', 'id'], ['desc', 'desc'])
    },
    isReaded(state, API) {
      return story => isReaded(API, story)
    },
    loadedOffset(state) {
      return feedId => {
        let begin = state.loadedOffsetBegin[feedId]
        // handle favorite storys
        while (!_.isNil(begin)) {
          if (_.isNil(state.storys[begin - 1])) {
            break
          }
          begin = begin - 1
        }
        let end = state.loadedOffsetEnd[feedId]
        // handle mushroom storys
        while (!_.isNil(end)) {
          if (_.isNil(state.storys[end + 1])) {
            break
          }
          end = end + 1
        }
        return { begin, end }
      }
    },
  },
  actions: {
    async setNextStoryGetter(DAO, getter) {
      DAO.SET_NEXT_STORY_GETTER(getter)
    },
    async setFavorited(DAO, { feedId, offset, is_favorited }) {
      await API.story.setFavorited({ feed_id: feedId, offset, is_favorited: is_favorited })
      DAO.SET_FAVORITED({ feed_id: feedId, offset, is_favorited })
    },
    async setWatched(DAO, { feedId, offset, is_watched }) {
      await API.story.setWatched({ feed_id: feedId, offset, is_watched: is_watched })
      DAO.SET_WATCHED({ feed_id: feedId, offset, is_watched })
    },
    async load(DAO, { feedId, offset, detail }) {
      let story = await API.story.get({ feed_id: feedId, offset, detail })
      DAO.ADD_OR_UPDATE(story)
    },
    async loadList(DAO, { feedId, offset, detail, size, resetLoadedOffset, isInit }) {
      if (isInit) {
        // load at least N items to support image dedup
        let total = DAO.API.feed.get(feedId).total_storys
        offset = Math.max(0, Math.min(offset, total - MIN_STORYS_FOR_IMAGE_DEDUP))
        size = Math.max(size, MIN_STORYS_FOR_IMAGE_DEDUP)
      }
      let data = await API.story.query({ feed_id: feedId, offset, detail, size })
      if (resetLoadedOffset) {
        DAO.RESET_LOADED_OFFSET(feedId)
      }
      let feedStorys = _.defaultTo(DAO.state.storys[feedId], {})
      let storys = detectDuplicatedStoryImages(data.storys, feedStorys)
      DAO.ADD_OR_UPDATE_LIST({ feedId, storys: storys })
      DAO.UPDATE_LOADED_OFFSET({ feedId, begin: offset, end: offset + size - 1 })
      setFeedTotalStorysIfUpdated(DAO, feedId, storys)
    },
    async loadMushrooms(DAO, { mushroomKeys, detail }) {
      await DAO.state.mushroomsLoading.begin(async () => {
        let data = await API.story.queryBatch({ storys: mushroomKeys, detail })
        let mushrooms = sortMushrooms(data.storys, DAO.API)
        DAO.ADD_OR_UPDATE_MUSHROOMS(mushrooms)
      })
    },
    async loadFavorited(DAO) {
      await DAO.state.favoritedLoading.begin(async () => {
        let data = await API.story.listFavorited()
        DAO.ADD_OR_UPDATE_LIST({ storys: data.storys })
      })
    },
    async fetchFulltext(DAO, { feedId, offset }) {
      let result = await API.story.fetchFulltext({ feed_id: feedId, offset: offset })
      if (!_.isNil(result.story)) {
        DAO.ADD_OR_UPDATE(result.story)
      }
      return result
    },
  },
}
