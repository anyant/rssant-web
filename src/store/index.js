import Vue from 'vue'
import Vuex from 'vuex'

import user from './modules/user'
import rss from './modules/rss'
import task from './modules/task'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user,
    rss,
    task
  },
  getters: {
    route(state) {
      return state.route
    }
  }
})

export default store
