import Vue from 'vue'
// muse-ui
import '@/plugin/muse-ui'
// fontawesome
import '@/plugin/fontawesome'
// styles
import 'material-design-icons/iconfont/material-icons.css'
import 'typeface-roboto'
// others
import { sync } from 'vuex-router-sync'
import Mescroll from 'mescroll.js/mescroll.vue'

// rssant
import App from './App'
import router from '@/router'
import { Store, API } from '@/store'
import { pageMixin } from '@/plugin/page'
import StoryRender from '@/plugin/storyRender'
import '@/styles/theme-rssant.less'
import '@/plugin/theme'

// REM layout
import initREM from '@/plugin/rem'

// localConfig
import localConfig from '@/plugin/localConfig'

// PWA Service Worker
import registerServiceWorker from '@/registerServiceWorker'

if (localConfig.PWA_ENABLE.get()) {
  registerServiceWorker()
}

initREM(true, 32, 1)

Vue.config.productionTip = false

sync(Store, router)

Vue.prototype.$API = API
Vue.mixin(pageMixin)

Vue.use(StoryRender)

// 上拉刷新下拉加载滚动列表
Vue.component('mescroll', Mescroll)

window.app = new Vue({
  el: '#app',
  router,
  render: h => h(App),
})

// remove spinner: https://pathgather.github.io/please-wait/
document.addEventListener('DOMContentLoaded', function() {
  let spiner = document.getElementById('rssant-spinner')
  if (spiner !== undefined && spiner !== null) {
    spiner.remove()
  }
})
