import _ from 'lodash'
import Vue from 'vue'
import { isAfter, subDays } from 'date-fns'
import Loading from '@/plugin/loading'
import { API } from '@/plugin/api'
import localFeeds from '@/plugin/localFeeds'

function isEmptyFeed(feed) {
  return feed.total_storys <= 0 || _.isEmpty(feed.dt_latest_story_published)
}

function isReadedFeed(feed) {
  return feed.num_unread_storys <= 0
}

function sortFeedList(feedList) {
  return _.reverse(
    _.sortBy(feedList, [
      function(x) {
        let dt = x.dt_latest_story_published || x.dt_created
        return new Date(dt)
      },
      'id',
    ])
  )
}

function groupFeedList(feedList) {
  // jungle 丛林    干度<500的订阅
  // garden 菌圃    干度>=500的订阅或空订阅
  // mushroom 蘑菇  最近2周菌圃中产出的故事
  let trash = []
  let gardenReaded = []
  let jungleReaded = []
  let gardenNotReaded = []
  let jungleNotReaded = []
  let mushroomKeys = []

  const dt_recent = subDays(new Date(), 14)

  let pickMushroom = feed => {
    if (feed.num_unread_storys >= 1 && feed.num_unread_storys <= 3) {
      mushroomKeys.push({
        feed_id: feed.id,
        offset: feed.story_offset,
        limit: feed.num_unread_storys,
      })
    } else if (feed.total_storys > 0) {
      let dt_latest = new Date(feed.dt_latest_story_published)
      if (isAfter(dt_latest, dt_recent)) {
        mushroomKeys.push({
          feed_id: feed.id,
          offset: feed.total_storys - 1,
          limit: 1,
        })
      }
    }
  }

  feedList.forEach(feed => {
    if (isEmptyFeed(feed)) {
      trash.push(feed)
    } else if (feed.dryness >= 500) {
      if (isReadedFeed(feed)) {
        gardenReaded.push(feed)
      } else {
        gardenNotReaded.push(feed)
      }
      pickMushroom(feed)
    } else {
      if (isReadedFeed(feed)) {
        jungleReaded.push(feed)
      } else {
        jungleNotReaded.push(feed)
      }
    }
  })
  return {
    trash,
    gardenReaded,
    jungleReaded,
    gardenNotReaded,
    jungleNotReaded,
    mushroomKeys,
  }
}

function updateFeedList(state) {
  let { trash, gardenReaded, jungleReaded, gardenNotReaded, jungleNotReaded, mushroomKeys } = groupFeedList(
    _.values(state.feeds)
  )
  state.mushroomKeys = mushroomKeys
  let feedList = _.concat(
    sortFeedList(jungleNotReaded),
    sortFeedList(gardenNotReaded),
    sortFeedList(jungleReaded),
    sortFeedList(gardenReaded),
    sortFeedList(trash)
  )
  state.feedList = feedList
}

function updateStateFeed(state, feed) {
  feed = fixTitle(feed)
  feed = normalizeFeedStoryOffset(feed)
  Vue.set(state.feeds, feed.id, feed)
}

function fixTitle(feed) {
  if (_.isEmpty(feed.title)) {
    feed.title = `#${feed.id}`
  }
  return feed
}

function normalizeFeedStoryOffset(feed) {
  if (_.isNil(feed.num_unread_storys) || _.isNil(feed.story_offset) || _.isNil(feed.total_storys)) {
    return feed
  }
  const MAX_UNREAD_STORYS = 99
  if (feed.num_unread_storys > MAX_UNREAD_STORYS) {
    feed.num_unread_storys = MAX_UNREAD_STORYS
    feed.story_offset = feed.total_storys - MAX_UNREAD_STORYS
  }
  return feed
}

function addOrUpdateCreation(state, creation) {
  let old = state.creations[creation.id]
  if (!_.isNil(old) && _.isEmpty(creation.message)) {
    creation.message = old.message
  }
  Vue.set(state.creations, creation.id, creation)
}

function watchFeedCreation(DAO, { creationId, numTry = 30 }) {
  const token = setInterval(() => {
    API.feed
      .getCreation({ id: creationId })
      .then(creation => {
        DAO.ADD_OR_UPDATE_CREATION(creation)
        if (creation.status === 'ready') {
          setTimeout(() => {
            clearInterval(token)
          }, 3000)
          DAO.API.feed.load({ feedId: creation.feed_id, detail: true })
        } else if (creation.status === 'error' || numTry <= 0) {
          clearInterval(token)
        }
      })
      .finally(() => {
        numTry -= 1
      })
  }, 1000)
}

function handleImportedFeedResult(DAO, data) {
  DAO.ADD_OR_UPDATE_LIST(data.created_feeds)
  DAO.ADD_OR_UPDATE_CREATION_LIST(data.feed_creations)
  if (data.feed_creations.length === 1) {
    watchFeedCreation(DAO, { creationId: data.feed_creations[0].id })
  }
  return {
    numFeedCreations: data.feed_creations.length,
    numCreatedFeeds: data.created_feeds.length,
    numExistedFeeds: data.num_existed_feeds,
  }
}

export default {
  state: {
    loading: new Loading(),
    loadingCreations: new Loading(),
    creations: {},
    feeds: {},
    feedList: [],
    mushroomKeys: [],
  },
  mutations: {
    SYNC(state, { updatedFeeds, deletedFeedIds }) {
      _.defaultTo(deletedFeedIds, []).forEach(feedId => {
        Vue.delete(state.feeds, feedId)
      })
      _.defaultTo(updatedFeeds, []).forEach(feed => {
        updateStateFeed(state, feed)
      })
      updateFeedList(state)
    },
    ADD_OR_UPDATE_CREATION(state, creation) {
      addOrUpdateCreation(state, creation)
    },
    ADD_OR_UPDATE_CREATION_LIST(state, creationList) {
      creationList.forEach(creation => {
        addOrUpdateCreation(state, creation)
      })
    },
    ADD_OR_UPDATE(state, feed) {
      updateStateFeed(state, feed)
      updateFeedList(state)
    },
    ADD_OR_UPDATE_LIST(state, feedList) {
      feedList.forEach(feed => {
        updateStateFeed(state, feed)
      })
      updateFeedList(state)
    },
    REMOVE(state, { id }) {
      Vue.delete(state.feeds, id)
      updateFeedList(state)
    },
    REMOVE_ALL(state, { feedIds = null } = {}) {
      if (_.isNil(feedIds)) {
        state.feeds = {}
      } else {
        feedIds.forEach(id => {
          Vue.delete(state.feeds, id)
        })
      }
      updateFeedList(state)
    },
    SET_STORY_OFFSET(state, { id, offset }) {
      let feed = state.feeds[id]
      feed.story_offset = offset
      feed.num_unread_storys = feed.total_storys - offset
    },
    SET_ALL_READED(state, { feedIds }) {
      feedIds.forEach(feedId => {
        let feed = state.feeds[feedId]
        feed.story_offset = feed.total_storys
        feed.num_unread_storys = 0
      })
    },
  },
  getters: {
    isLoading(state) {
      return state.loading.isLoading
    },
    isEmpty(state) {
      let numFeeds = _.size(state.feeds)
      let numFeedCreations = _.size(state.creations)
      return numFeeds <= 0 && numFeedCreations <= 0
    },
    creations(state) {
      return _.reverse(_.sortBy(_.values(state.creations), ['dt_created', 'status']))
    },
    getCreation(state) {
      return creationId => {
        return state.creations[creationId]
      }
    },
    feedList(state) {
      return state.feedList
    },
    mushroomKeys(state) {
      return state.mushroomKeys
    },
    get(state) {
      return feedId => {
        return state.feeds[feedId]
      }
    },
  },
  actions: {
    async sync(DAO) {
      await DAO.state.loading.begin(async () => {
        let feeds = localFeeds.get()
        if (!_.isNil(feeds)) {
          DAO.ADD_OR_UPDATE_LIST(feeds)
        }
        let hints = []
        _.forEach(_.values(DAO.state.feeds), x => {
          if (!_.isEmpty(x.dt_updated)) {
            hints.push({ id: x.id, dt_updated: x.dt_updated })
          }
        })
        await API.feed.query({ hints }).then(result => {
          DAO.SYNC({
            updatedFeeds: result.feeds,
            deletedFeedIds: result.deleted_ids,
          })
          localFeeds.set(DAO.feedList)
        })
      })
    },
    async loadCreationList(DAO) {
      await DAO.state.loadingCreations.begin(async () => {
        await API.feed.queryCreationList().then(result => {
          DAO.ADD_OR_UPDATE_CREATION_LIST(result.feed_creations)
        })
      })
    },
    async load(DAO, { feedId, detail }) {
      let feed = await API.feed.get({ id: feedId, detail })
      DAO.ADD_OR_UPDATE(feed)
    },
    async loadCreation(DAO, { creationId, detail }) {
      let creation = await API.feed.getCreation({ id: creationId, detail })
      DAO.ADD_OR_UPDATE_CREATION(creation)
    },
    async update(DAO, { feedId, title }) {
      let newFeed = await API.feed.update({
        id: feedId,
        title: title,
      })
      DAO.ADD_OR_UPDATE(newFeed)
    },
    async delete(DAO, { feedId }) {
      await API.feed.delete({
        id: feedId,
      })
      DAO.API.story.DELETE_STORYS_OF_FEED(feedId)
      DAO.REMOVE({ id: feedId })
    },
    async deleteAll(DAO, { feedIds = null } = {}) {
      if (_.isNil(feedIds) || feedIds.length > 0) {
        await API.feed.deleteAll({ ids: feedIds })
        DAO.REMOVE_ALL({ feedIds })
        DAO.API.story.DELETE_STORYS_OF_ALL_FEED({ feedIds })
        localFeeds.clear()
      }
    },
    async import(DAO, { text }) {
      let data = await API.feed.import({ text })
      return handleImportedFeedResult(DAO, data)
    },
    async importFile(DAO, { file }) {
      let data = await API.feed.importFile({ file })
      return handleImportedFeedResult(DAO, data)
    },
    exportOPML(DAO, { download } = {}) {
      API.feed.exportOPML({ download })
    },
    async setStoryOffset(DAO, { feedId, offset }) {
      if (DAO.get(feedId).story_offset !== offset) {
        await API.feed.setStoryOffset({ id: feedId, offset })
        DAO.SET_STORY_OFFSET({ id: feedId, offset })
      }
    },
    async setAllReaded(DAO, { feedIds }) {
      feedIds = feedIds.filter(feedId => {
        return DAO.get(feedId).num_unread_storys > 0
      })
      if (feedIds.length > 0) {
        await API.feed.setAllReaded({ ids: feedIds })
        DAO.SET_ALL_READED({ feedIds })
      }
    },
  },
}
