import Vue from 'vue'
import Router from 'vue-router'
// muse-ui
import '@/plugin/muse-ui'
// fontawesome
import '@/plugin/fontawesome'
// styles
import 'material-design-icons/iconfont/material-icons.css'
import 'typeface-roboto'
// others
import Mescroll from 'mescroll.js/mescroll.vue'
import DarkMode from '@/plugin/darkmode'

// rssant
import App from './App'
import PublishApp from './publish/App'
import { createRouter } from '@/router'
import { createPublishRouter } from '@/publish/router'
import { hamiVuex } from '@/store'
import { pageMixin } from '@/store/page'
import StoryRender from '@/plugin/storyRender'
import { LAYOUT } from '@/plugin/common'
import '@/styles/theme-rssant.less'
import '@/plugin/theme'

// REM layout
import initREM from '@/plugin/rem'

// PWA Service Worker
import { initPWA } from '@/plugin/pwa'

initPWA()
initREM(true, 32, 1)
DarkMode.init()

Vue.config.productionTip = false

Vue.use(Router)
Vue.prototype.$LAYOUT = LAYOUT
Vue.mixin(pageMixin)

Vue.use(StoryRender)

// 上拉刷新下拉加载滚动列表
Vue.component('mescroll', Mescroll)

function isPublishPage() {
  let path = window.location.pathname
  return path.startsWith('/rssant/')
}

function createApp() {
  if (isPublishPage()) {
    const router = createPublishRouter()
    return new Vue({
      el: '#app',
      router,
      store: hamiVuex.vuexStore,
      render: h => h(PublishApp),
    })
  } else {
    const router = createRouter()
    return new Vue({
      el: '#app',
      router,
      store: hamiVuex.vuexStore,
      render: h => h(App),
    })
  }
}

window.app = createApp()

// remove spinner: https://pathgather.github.io/please-wait/
document.addEventListener('DOMContentLoaded', function() {
  let spiner = document.getElementById('rssant-spinner')
  if (spiner !== undefined && spiner !== null) {
    spiner.remove()
  }
  let darkModeStyle = document.getElementById('rssant-dark-mode-style')
  if (darkModeStyle !== undefined && darkModeStyle !== null) {
    darkModeStyle.remove()
  }
})
