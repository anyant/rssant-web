import Vue from 'vue'
// muse-ui
import '@/plugin/muse-ui'
// fontawesome
import '@/plugin/fontawesome'
// styles
import 'material-design-icons/iconfont/material-icons.css'
import 'typeface-roboto'
// others
import Mescroll from 'mescroll.js/mescroll.vue'
import { auto as DarkReaderAuto } from 'darkreader'

// rssant
import App from './App'
import router from '@/router'
import { API } from '@/store'
import { pageMixin } from '@/plugin/page'
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

// https://github.com/darkreader/darkreader
DarkReaderAuto({
  brightness: 95,
  contrast: 95,
})

Vue.config.productionTip = false

Vue.prototype.$API = API
Vue.prototype.$LAYOUT = LAYOUT
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
