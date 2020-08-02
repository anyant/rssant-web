import _ from 'lodash'
import Vue from 'vue'
import Loading from '@/plugin/loading'
import { API } from '@/plugin/api'

function sortMushrooms(mushrooms, API) {
  return _.sortBy(mushrooms, [
    function(x) {
      return !API.story.isReaded(x)
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
  let old = feedStorys[story.offset]
  if (_.isNil(old) || !_.isEmpty(story.content)) {
    Vue.set(feedStorys, story.offset, story)
  }
}

export default {
  state: {
    storys: {},
    mushrooms: [],
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
      state.mushrooms = storys
    },
    DELETE_STORYS_OF_FEED(state, feedId) {
      Vue.delete(state.storys, feedId)
      Vue.delete(state.loadedOffsetBegin, feedId)
      Vue.delete(state.loadedOffsetEnd, feedId)
      state.mushrooms = state.mushrooms.filter(x => {
        return x.feed.id !== feedId
      })
    },
    DELETE_STORYS_OF_ALL_FEED(state, { feedIds = null } = {}) {
      if (_.isNil(feedIds)) {
        state.storys = {}
        state.mushrooms = []
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
      state.mushrooms = state.mushrooms.filter(x => {
        return _.isNil(feedIdsMap[x.feed.id])
      })
    },
  },
  getters: {
    get(state) {
      return ({ feedId, offset }) => {
        return _.defaultTo(state.storys[feedId], {})[offset]
      }
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
    mushrooms(state) {
      return state.mushrooms
    },
    nextMushroom(state) {
      return ({ feedId, offset }) => {
        let index = state.mushrooms.findIndex(story => {
          return story.feed.id === feedId && story.offset === offset
        })
        if (index >= 0 && index + 1 < state.mushrooms.length) {
          return state.mushrooms[index + 1]
        }
        return null
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
      return story => {
        let feed = API.feed.get(story.feed.id)
        if (_.isNil(feed)) {
          return false
        }
        return story.offset < feed.story_offset
      }
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
    async loadList(DAO, { feedId, offset, detail, size, resetLoadedOffset }) {
      let data = await API.story.query({ feed_id: feedId, offset, detail, size })
      if (resetLoadedOffset) {
        DAO.RESET_LOADED_OFFSET(feedId)
      }
      DAO.ADD_OR_UPDATE_LIST({ feedId, storys: data.storys })
      DAO.UPDATE_LOADED_OFFSET({ feedId, begin: offset, end: offset + size - 1 })
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
  },
}
