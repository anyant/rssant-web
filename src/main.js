import Vue from 'vue'
// muse-ui
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'muse-ui-message/dist/muse-ui-message.css';
import 'muse-ui-loading/dist/muse-ui-loading.css'
import Loading from 'muse-ui-loading'
import Toast from 'muse-ui-toast'
import MuseMessage from 'muse-ui-message';
// styles
import 'material-design-icons/iconfont/material-icons.css'
import 'font-awesome/css/font-awesome.css'
import 'typeface-roboto'
// others
import { sync } from 'vuex-router-sync'
import Mescroll from "mescroll.js/mescroll.vue";
import virtualList from 'vue-virtual-scroll-list'

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

initREM(true, 32, 1);

Vue.config.productionTip = false

sync(Store, router)

Vue.prototype.$API = API
Vue.mixin(pageMixin)

Vue.use(StoryRender)
Vue.use(MuseUI)
Vue.use(Loading)
Vue.use(MuseMessage)
Vue.use(Toast, {
  time: 3000,
  close: false
})
// 上拉刷新下拉加载滚动列表
Vue.component('mescroll', Mescroll)
Vue.component('virtual-list', virtualList)

window.app = new Vue({
  el: '#app',
  router,
  render: h => h(App)
})

// remove spinner: https://pathgather.github.io/please-wait/
document.addEventListener('DOMContentLoaded', function () {
  let spiner = document.getElementById('rssant-spinner')
  if (spiner !== undefined && spiner !== null) {
    spiner.remove()
  }
});
