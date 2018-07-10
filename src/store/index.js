import Vue from 'vue'
import Vuex from 'vuex'

import user from './modules/user'
import feed from './modules/feed'
import task from './modules/task'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user,
    feed,
    task,
  }
})

export default store
