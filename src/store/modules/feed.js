import api from '@/plugin/api'

const state = {
  feedList: []
}

const getters = {
  feedList(state) {
    return state.feedList
  }
}

const mutations = {
  addFeed(state, feed) {
    state.feedList.push(feed)
  }
}

const actions = {
  async createFeed({
    commit
  }, {
    name,
    url
  }) {
    let feed = await api.call('/rss/create_feed', {
      name,
      url
    })
    commit('addFeed', feed)
  }
}


export default {
  state,
  getters,
  mutations,
  actions
}
