import _ from 'lodash'
import Vue from 'vue'
import { isAfter, subDays } from 'date-fns'
import Loading from '@/plugin/loading'
import { API } from '@/plugin/api'
import localFeeds from '@/plugin/localFeeds'
import { GROUP_MUSHROOM, GROUP_SOLO, getGroupName, isSystemGroup } from '@/plugin/feedGroupHelper'
import { hamiVuex } from '.'

function isEmptyFeed(feed) {
  return feed.total_storys <= 0 || _.isEmpty(feed.dt_latest_story_published)
}

function isReadedFeed(feed) {
  return feed.num_unread_storys <= 0
}

function getFeedGroup(feed) {
  let group = feed.group
  if (_.isEmpty(group)) {
    group = feed.dryness >= 500 ? GROUP_MUSHROOM : GROUP_SOLO
  }
  return group
}

function isMushroomFeed(feed) {
  return getFeedGroup(feed) === GROUP_MUSHROOM
}

function _sortGroupFeedList(feedList) {
  return _.reverse(
    _.sortBy(feedList, [
      function(x) {
        return new Date(x.dt_latest_story_published || x.dt_created)
      },
      'id',
    ])
  )
}

function sortFeedList(feedList) {
  // jungle 丛林    干度<500的订阅
  // garden 菌圃    干度>=500的订阅
  // trash  废墟    没有任何内容的订阅
  let trash = []
  let gardenReaded = []
  let jungleReaded = []
  let gardenNotReaded = []
  let jungleNotReaded = []
  feedList.forEach(feed => {
    if (isEmptyFeed(feed)) {
      trash.push(feed)
    } else if (isMushroomFeed(feed)) {
      if (isReadedFeed(feed)) {
        gardenReaded.push(feed)
      } else {
        gardenNotReaded.push(feed)
      }
    } else {
      if (isReadedFeed(feed)) {
        jungleReaded.push(feed)
      } else {
        jungleNotReaded.push(feed)
      }
    }
  })
  return _.concat(
    _sortGroupFeedList(jungleNotReaded),
    _sortGroupFeedList(gardenNotReaded),
    _sortGroupFeedList(jungleReaded),
    _sortGroupFeedList(gardenReaded),
    _sortGroupFeedList(trash)
  )
}

function _pickMushroomKeys(feed, dt_recent) {
  let mushroomKeys = []
  if (isMushroomFeed(feed)) {
    // 品读: 未读1-3的订阅文章或最近14天的文章
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
  } else if (!isSystemGroup(getFeedGroup(feed))) {
    // 自定义分组: 未读1-3的订阅文章直接展示
    if (feed.num_unread_storys >= 1 && feed.num_unread_storys <= 3) {
      mushroomKeys.push({
        feed_id: feed.id,
        offset: feed.story_offset,
        limit: feed.num_unread_storys,
      })
    }
  }
  return mushroomKeys
}

function updateFeedList(state) {
  // compute mushroom keys
  let mushroomKeys = []
  const dt_recent = subDays(new Date(), 14)
  _.forEach(_.values(state.feeds), feed => {
    _pickMushroomKeys(feed, dt_recent).forEach(x => mushroomKeys.push(x))
  })
  // compute feed groups and home feeds
  let feedGroupMap = {}
  _.forEach(_.values(state.feeds), feed => {
    let group = getFeedGroup(feed)
    if (_.isNil(feedGroupMap[group])) {
      feedGroupMap[group] = []
    }
    feedGroupMap[group].push(feed)
  })
  let mushroomFeeds = _.defaultTo(feedGroupMap[GROUP_MUSHROOM], [])
  let soloFeeds = _.defaultTo(feedGroupMap[GROUP_SOLO], [])
  let homeFeedList = sortFeedList(_.concat(mushroomFeeds, soloFeeds))
  delete feedGroupMap[GROUP_MUSHROOM]
  delete feedGroupMap[GROUP_SOLO]
  let feedGroups = []
  _.forEach(_.toPairs(feedGroupMap), ([group, groupFeeds]) => {
    let groupFeedIds = sortFeedList(groupFeeds).map(x => x.id)
    feedGroups.push({
      name: group,
      feedIds: groupFeedIds,
    })
  })
  let sortKeys = [x => getNumUnreadOfGroup(state, x) <= 0, x => getLatestDateOfGroup(state, x)]
  feedGroups = _.reverse(_.sortBy(feedGroups, sortKeys))
  state.feedGroups = feedGroups
  state.homeFeedIds = homeFeedList.map(x => x.id)
  state.mushroomKeys = mushroomKeys
}

function getNumUnreadOfGroup(state, group) {
  let feedList = _getFeedsByIds(state, group.feedIds)
  return _.sumBy(feedList, x => x.num_unread_storys)
}

function getLatestDateOfGroup(state, group) {
  // group feeds are sorted, the first is latest
  for (let feedId of group.feedIds) {
    let feed = state.feeds[feedId]
    if (!_.isNil(feed)) {
      let dt = feed.dt_latest_story_published || feed.dt_created
      if (!_.isNil(dt) && dt !== '') {
        return new Date(dt)
      }
    }
  }
  return null
}

function _getFeedsByIds(state, ids) {
  return ids.map(x => state.feeds[x]).filter(x => !_.isNil(x))
}

function updateStateFeed(state, feed) {
  // make Vue.set atomic, avoid partial updates
  let newFeed = {}
  Object.assign(newFeed, _.defaultTo(state.feeds[feed.id], {}))
  Object.assign(newFeed, feed)
  newFeed = fixTitle(newFeed)
  newFeed = normalizeFeedStoryOffset(newFeed)
  Vue.set(state.feeds, newFeed.id, newFeed)
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
  const MAX_NEW_UNREAD_STORYS = 15
  const isNewFeed = feed.story_offset <= 0
  if (isNewFeed && feed.num_unread_storys > MAX_NEW_UNREAD_STORYS) {
    feed.num_unread_storys = MAX_NEW_UNREAD_STORYS
    feed.story_offset = feed.total_storys - MAX_NEW_UNREAD_STORYS
  }
  const MAX_UNREAD_STORYS = 300
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

export const feedStore = hamiVuex.store({
  $name: 'feed',
  $state() {
    return {
      loading: new Loading(),
      loadingCreations: new Loading(),
      creations: {},
      feeds: {},
      feedGroups: [],
      homeFeedIds: [],
      mushroomKeys: [],
    }
  },
  SYNC({ updatedFeeds, deletedFeedIds }) {
    this.$patch(state => {
      _.defaultTo(deletedFeedIds, []).forEach(feedId => {
        Vue.delete(state.feeds, feedId)
      })
      _.defaultTo(updatedFeeds, []).forEach(feed => {
        updateStateFeed(state, feed)
      })
      updateFeedList(state)
    })
  },
  ADD_OR_UPDATE_CREATION(creation) {
    this.$patch(state => {
      addOrUpdateCreation(state, creation)
    })
  },
  ADD_OR_UPDATE_CREATION_LIST(creationList) {
    this.$patch(state => {
      creationList.forEach(creation => {
        addOrUpdateCreation(state, creation)
      })
    })
  },
  ADD_OR_UPDATE(feed) {
    this.$patch(state => {
      updateStateFeed(state, feed)
      updateFeedList(state)
    })
  },
  ADD_OR_UPDATE_LIST(feedList) {
    this.$patch(state => {
      feedList.forEach(feed => {
        updateStateFeed(state, feed)
      })
      updateFeedList(state)
    })
  },
  UPDATE_ALL_GROUP({ feedIds, group }) {
    this.$patch(state => {
      _.forEach(_getFeedsByIds(state, feedIds), feed => {
        Vue.set(feed, 'group', group)
      })
      updateFeedList(state)
    })
  },
  REMOVE({ id }) {
    this.$patch(state => {
      Vue.delete(state.feeds, id)
      updateFeedList(state)
    })
  },
  REMOVE_ALL({ feedIds = null } = {}) {
    this.$patch(state => {
      if (_.isNil(feedIds)) {
        state.feeds = {}
      } else {
        feedIds.forEach(id => {
          Vue.delete(state.feeds, id)
        })
      }
      updateFeedList(state)
    })
  },
  SET_STORY_OFFSET({ id, offset }) {
    this.$patch(state => {
      let feed = state.feeds[id]
      feed.story_offset = offset
      feed.num_unread_storys = feed.total_storys - offset
    })
  },
  SET_TOTAL_STORYS_IF_UPDATED({ id, total }) {
    this.$patch(state => {
      let feed = state.feeds[id]
      if (total > feed.total_storys) {
        feed.total_storys = total
        feed.num_unread_storys = feed.total_storys - feed.story_offset
      }
    })
  },
  SET_ALL_READED({ feedIds }) {
    this.$patch(state => {
      feedIds.forEach(feedId => {
        let feed = state.feeds[feedId]
        feed.story_offset = feed.total_storys
        feed.num_unread_storys = 0
      })
    })
  },
  get isLoading() {
    return this.loading.isLoading
  },
  get isEmpty() {
    let numFeeds = _.size(this.feeds)
    let numFeedCreations = _.size(this.creations)
    return numFeeds <= 0 && numFeedCreations <= 0
  },
  get numFeeds() {
    return _.size(this.feeds)
  },
  get feedIds() {
    return _.keys(this.feeds)
  },
  get creationList() {
    return _.reverse(_.sortBy(_.values(this.creations), ['dt_created', 'status']))
  },
  getCreation(creationId) {
    return this.creations[creationId]
  },
  get homeFeedList() {
    return _getFeedsByIds(this, this.homeFeedIds)
  },
  feedListOfGroup(group) {
    let feedIds = _.isNil(group) ? [] : group.feedIds
    return _getFeedsByIds(this, feedIds)
  },
  numUnreadOfGroup(group) {
    return _.isNil(group) ? null : getNumUnreadOfGroup(this, group)
  },
  latestDateOfGroup(group) {
    return _.isNil(group) ? null : getLatestDateOfGroup(this, group)
  },
  groupOf(feed) {
    return _.isNil(feed) ? null : getFeedGroup(feed)
  },
  get avaliableGroups() {
    let sysNames = [GROUP_SOLO, GROUP_MUSHROOM]
    let customNames = this.feedGroups.map(x => x.name)
    customNames = _.sortBy(customNames)
    return _.concat(sysNames, customNames)
  },
  get avaliableGroupNames() {
    return this.avaliableGroups.map(getGroupName)
  },
  getGroupByName(name) {
    for (let g of this.feedGroups) {
      if (g.name === name) {
        return g
      }
    }
    return null
  },
  get(feedId) {
    return this.feeds[feedId]
  },
  async sync() {
    await this.loading.begin(async () => {
      let feeds = localFeeds.get()
      if (!_.isNil(feeds)) {
        this.ADD_OR_UPDATE_LIST(feeds)
      }
      let hints = []
      _.forEach(_.values(this.feeds), x => {
        if (!_.isEmpty(x.dt_updated)) {
          hints.push({ id: x.id, dt_updated: x.dt_updated })
        }
      })
      await API.feed.query({ hints }).then(result => {
        this.SYNC({
          updatedFeeds: result.feeds,
          deletedFeedIds: result.deleted_ids,
        })
        localFeeds.set(_.values(this.feeds))
      })
    })
  },
  async loadCreationList() {
    await this.loadingCreations.begin(async () => {
      await API.feed.queryCreationList().then(result => {
        this.ADD_OR_UPDATE_CREATION_LIST(result.feed_creations)
      })
    })
  },
  async load({ feedId, detail }) {
    let feed = await API.feed.get({ id: feedId, detail })
    this.ADD_OR_UPDATE(feed)
  },
  async loadCreation({ creationId, detail }) {
    let creation = await API.feed.getCreation({ id: creationId, detail })
    this.ADD_OR_UPDATE_CREATION(creation)
  },
  async setTitle({ feedId, title }) {
    let newFeed = await API.feed.setTitle({ id: feedId, title: title })
    this.ADD_OR_UPDATE(newFeed)
  },
  async setAllGroup({ feedIds, group }) {
    if (_.isEmpty(feedIds)) {
      return
    }
    await API.feed.setAllGroup({ ids: feedIds, group: group })
    this.UPDATE_ALL_GROUP({ feedIds, group })
  },
  async delete({ feedId, storyStore }) {
    await API.feed.delete({
      id: feedId,
    })
    storyStore.DELETE_STORYS_OF_FEED(feedId)
    this.REMOVE({ id: feedId })
  },
  async deleteAll({ feedIds = null, storyStore } = {}) {
    if (_.isNil(feedIds) || feedIds.length > 0) {
      await API.feed.deleteAll({ ids: feedIds })
      this.REMOVE_ALL({ feedIds })
      storyStore.DELETE_STORYS_OF_ALL_FEED({ feedIds })
      localFeeds.clear()
    }
  },
  _watchFeedCreation({ creationId, numTry = 10 }) {
    const token = setInterval(() => {
      API.feed
        .getCreation({ id: creationId })
        .then(creation => {
          this.ADD_OR_UPDATE_CREATION(creation)
          if (creation.status === 'ready') {
            setTimeout(() => {
              clearInterval(token)
            }, 3500)
            feedStore.load({ feedId: creation.feed_id, detail: true })
          } else if (creation.status === 'error' || numTry <= 0) {
            clearInterval(token)
          }
        })
        .finally(() => {
          numTry -= 1
        })
    }, 3000)
  },
  _handleImportedFeedResult(data) {
    this.ADD_OR_UPDATE_LIST(data.created_feeds)
    this.ADD_OR_UPDATE_CREATION_LIST(data.feed_creations)
    if (data.feed_creations.length === 1) {
      this._watchFeedCreation({ creationId: data.feed_creations[0].id })
    }
    return {
      numFeedCreations: data.feed_creations.length,
      numCreatedFeeds: data.created_feeds.length,
      numExistedFeeds: data.num_existed_feeds,
      firstExistedFeed: data.first_existed_feed,
    }
  },
  async import({ text, group }) {
    group = group === GROUP_SOLO ? null : group
    let data = await API.feed.import({ text, group })
    return this._handleImportedFeedResult(data)
  },
  async importFile({ file, group }) {
    group = group === GROUP_SOLO ? null : group
    let data = await API.feed.importFile({ file, group })
    return this._handleImportedFeedResult(data)
  },
  exportOPML({ download } = {}) {
    API.feed.exportOPML({ download })
  },
  async setStoryOffset({ feedId, offset }) {
    if (this.get(feedId).story_offset !== offset) {
      await API.feed.setStoryOffset({ id: feedId, offset })
      this.SET_STORY_OFFSET({ id: feedId, offset })
    }
  },
  async setAllReaded({ feedIds }) {
    feedIds = feedIds.filter(feedId => {
      return this.get(feedId).num_unread_storys > 0
    })
    if (feedIds.length > 0) {
      await API.feed.setAllReaded({ ids: feedIds })
      this.SET_ALL_READED({ feedIds })
    }
  },
})
