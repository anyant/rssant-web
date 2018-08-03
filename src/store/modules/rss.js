import Vue from 'vue'
import api from '@/plugin/api'
import * as lodash from 'lodash-es'

const state = {
  feedStore: {},
  feedNextCursor: null,
  isFeedListReady: false,
  currentFeedId: null,
  storyStore: {},
  storyNextCursor: null,
  currentStoryId: null,
  isAddFeedDialogOpen: false
}

const getters = {
  feedList(state) {
    return lodash
      .chain(lodash.values(state.feedStore))
      .sortBy('dt_updated', 'id')
      .reverse()
      .value()
  },

  getFeed(state) {
    return feedId => state.feedStore[feedId]
  },

  currentFeed(state) {
    if (lodash.isNil(state.currentFeedId)) {
      return null
    }
    return state.feedStore[state.currentFeedId]
  },

  currentFeedTitle(state, getters) {
    let feed = getters.currentFeed
    let title = null
    if (!lodash.isNil(feed)) {
      title = feed.title
    }
    if (lodash.isEmpty(title))
      if (lodash.isNil(state.route)) {
        title = '无标题'
      } else {
        title = state.route.params.feedId
      }
    return title
  },
  storyList(state) {
    return lodash
      .chain(lodash.values(state.storyStore))
      .sortBy('dt_updated', 'id')
      .value()
  },

  getStory(state) {
    return storyId => state.storyStore[storyId]
  },

  currentStory(state) {
    if (lodash.isNil(state.currentStoryId)) {
      return null
    }
    return state.storyStore[state.currentStoryId]
  }
}

const mutations = {
  addFeed(state, feed) {
    Vue.set(state.feedStore, feed.id, feed)
  },

  updateFeed(state, feed) {
    Vue.set(state.feedStore, feed.id, feed)
  },

  deleteFeed(state, feedId) {
    Vue.delete(state.feedStore, feedId)
  },

  setFeedList(state, feedList) {
    let feedStore = {}
    feedList.forEach(feed => {
      feedStore[feed.id] = feed
    })
    state.feedStore = feedStore
    state.isFeedListReady = true
  },

  extendFeedList(state, feedList) {
    feedList.forEach(feed => {
      Vue.set(state.feedStore, feed.id, feed)
    })
  },

  setFeedNextCursor(state, cursor) {
    state.feedNextCursor = cursor
  },

  setStoryList(state, storyList) {
    let storyStore = {}
    storyList.forEach(story => {
      storyStore[story.id] = story
    })
    state.storyStore = storyStore
  },

  extendStoryList(state, storyList) {
    storyList.forEach(story => {
      Vue.set(state.storyStore, story.id, story)
    })
  },

  setStoryNextCursor(state, cursor) {
    state.storyNextCursor = cursor
  },

  addStory(state, story) {
    Vue.set(state.storyStore, story.id, story)
  },

  setCurrentFeed(state, feedId) {
    state.currentFeedId = feedId
  },

  setCurrentStory(state, storyId) {
    state.currentStoryId = storyId
  },
  closeAddFeedDialog(state) {
    state.isAddFeedDialogOpen = false
  },
  openAddFeedDialog(state) {
    state.isAddFeedDialogOpen = true
  }
}

const actions = {
  async createFeed({ commit, dispatch }, { url }) {
    let feed = await api.call('/rss/create_feed', { url })
    commit('addFeed', feed)
    let feedId = feed.id
    let numTry = 30
    const token = setInterval(async () => {
      try {
        feed = await dispatch('fetchFeed', feedId)
      } finally {
        numTry -= 1
        if (feed.status === 'ready' || feed.status === 'error' || numTry <= 0) {
          clearInterval(token)
        }
      }
    }, 1000)
    return feed
  },

  async updateFeed({ commit }, { feedId, url }) {
    let newFeed = await api.call('/rss/update_feed', {
      feed_id: feedId,
      url: url
    })
    commit('updateFeed', newFeed)
    return newFeed
  },

  async deleteFeed({ commit }, feedId) {
    await api.call('/rss/delete_feed', {
      feed_id: feedId
    })
    commit('deleteFeed', feedId)
  },

  async fetchFeedList({ commit }) {
    let result = await api.call('rss/get_feed_list')
    commit('setFeedList', result.feeds)
    commit('setFeedNextCursor', result.cursor)
    return result.page_size
  },

  async fetchMoreFeedList({ state, commit }) {
    if (lodash.isEmpty(state.feedNextCursor)) {
      return 0
    }
    let result = await api.call('rss/get_feed_list', { cursor: state.feedNextCursor })
    commit('extendFeedList', result.feeds)
    commit('setFeedNextCursor', result.cursor)
    return result.page_size
  },

  async fetchFeed({ commit }, feedId) {
    let feed = await api.call('/rss/get_feed', { feed_id: feedId })
    commit('addFeed', feed)
    return feed
  },

  async fetchStoryList({ commit }, feedId) {
    let result = await api.call('rss/get_story_list', {
      feed_id: feedId
    })
    commit('setStoryNextCursor', result.cursor)
    commit('setStoryList', result.storys)
    return result.page_size
  },

  async fetchMoreStoryList({ state, commit }) {
    if (lodash.isEmpty(state.storyNextCursor)) {
      return 0
    }
    let result = await api.call('rss/get_story_list', {
      feed_id: state.currentFeedId,
      cursor: state.storyNextCursor
    })
    commit('setStoryNextCursor', result.cursor)
    commit('extendStoryList', result.storys)
    return result.page_size
  },

  async setCurrentFeed({ commit, getters, dispatch }, feedId) {
    commit('setCurrentFeed', feedId)
    let currentFeed = getters.currentFeed
    if (lodash.isNil(currentFeed) || lodash.isNil(currentFeed.data)) {
      dispatch('fetchFeed', feedId)
    }
  },

  async setCurrentStory({ commit, getters, dispatch }, storyId) {
    commit('setCurrentStory', storyId)
    let currentStory = getters.currentStory
    if (lodash.isNil(currentStory) || lodash.isNil(currentStory.data)) {
      let story = await api.call('/rss/get_story', { story_id: storyId })
      commit('addStory', story)
      dispatch('setCurrentFeed', story.feed_id)
    }
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
