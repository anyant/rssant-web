import Vue from 'vue'
import api from '@/plugin/api'
import * as lodash from 'lodash-es'

const state = {
  feedStore: {},
  isFeedStoreReady: false,
  currentFeedId: null,
  storyStore: {},
  isStoryStoreReady: false,
  currentStoryId: null
}

const getters = {
  feedList(state) {
    return lodash
      .chain(lodash.values(state.feedStore))
      .sortBy('dtu')
      .reverse()
      .value()
  },

  isFeedListReady(state) {
    return state.isFeedStoreReady
  },

  getFeed(state, feedId) {
    if (!getters.isFeedListReady) {
      return null
    }
    return state.feedStore[feedId]
  },

  currentFeed(state, getters) {
    if (!getters.isFeedListReady) {
      return null
    }
    if (lodash.isNil(state.currentFeedId)) {
      return null
    }
    return state.feedStore[state.currentFeedId]
  },

  storyList(state) {
    return lodash
      .chain(lodash.values(state.storyStore))
      .sortBy('dtu')
      .value()
  },

  isStoryListReady(state) {
    return state.isStoryListReady
  },

  currentStory(state, getters) {
    if (!getters.isStoryListReady) {
      return null
    }
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
    state.isFeedStoreReady = true
  },

  setStoryList(state, storyList) {
    let storyStore = {}
    storyList.forEach(story => {
      storyStore[story.id] = story
    })
    state.feedStore = storyStore
    state.isStoryStoreReady = true
  },

  addStory(state, story) {
    Vue.set(state.storyStore, story.id, story)
  },

  setCurrentFeed(state, feedId) {
    state.currentFeedId = feedId
  },

  setCurrentStory(state, storyId) {
    state.currentStoryId = storyId
  }
}

const actions = {
  async createFeed({ commit }, { name, url }) {
    let feed = await api.call('/rss/create_feed', {
      name,
      url
    })
    commit('addFeed', feed)
    return feed
  },

  async updateFeed({ commit }, { feedId, name, url }) {
    let newFeed = await api.call('/rss/update_feed', {
      id: feedId,
      name: name,
      url: url
    })
    commit('updateFeed', newFeed)
    return newFeed
  },

  async deleteFeed({ commit }, feedId) {
    await api.call('/rss/delete_feed', {
      id: feedId
    })
    commit('deleteFeed', feedId)
  },

  async fetchFeedList({ commit }) {
    let feedList = await api.call('rss/get_feed_list')
    commit('setFeedList', feedList)
  },

  async fetchFeed({ commit }, feedId) {
    let feed = await api.call('/rss/get_feed', { id: feedId })
    commit('addFeed', feed)
    return feed
  },

  async fetchStoryList({ commit }, feedId) {
    let storyList = await api.call('rss/get_story_list', { feed_id: feedId })
    commit('setStoryList', storyList)
  },

  async setCurrentFeed({ commit, getters }, feedId) {
    commit('setCurrentFeed', feedId)
    let currentFeed = getters.currentFeed
    if (lodash.isNil(currentFeed)) {
      let feed = await api.call('/rss/get_feed', { id: feedId })
      commit('addFeed', feed)
    }
  },

  async setCurrentStory({ commit, getters, dispatch }, storyId) {
    commit('setCurrentStory', storyId)
    let currentStory = getters.currentStory
    if (lodash.isNil(currentStory)) {
      let story = await api.call('/rss/get_story', { id: storyId })
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
