import Vue from 'vue'
import App from './App'
import {
  sync
} from 'vuex-router-sync'
import router from './router'
import store from './/store'
import api from './plugin/api'

Vue.config.productionTip = false

sync(store, router)
Vue.prototype.$api = api

window.app = new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
