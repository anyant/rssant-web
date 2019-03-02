import Vue from 'vue'
import App from './App'
import { sync } from 'vuex-router-sync'
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'font-awesome/css/font-awesome.css'
import 'typeface-roboto'
import '@/styles/theme-rssant.less'
import Notification from '@/plugin/notify'
import { Message, Table, TableColumn, Loading } from 'element-ui'
import moment from 'moment'
import 'moment/locale/zh-cn'
import VueMoment from 'vue-moment'
import VirtualScrollList from 'vue-virtual-scroll-list'

import router from './router'
import { STORE, StoreAPI } from './store'
import API from './plugin/api'

Vue.config.productionTip = false

sync(STORE, router)
Vue.prototype.$API = API
Vue.prototype.$StoreAPI = StoreAPI
Vue.prototype.$notify = Notification
Vue.prototype.$message = Message
Vue.prototype.$loading = Loading.service

Vue.use(Loading.directive)
Vue.use(MuseUI)
// muse-ui 的 Table 组件有性能问题，改用 element-ui
Vue.component(Table.name, Table)
Vue.component(TableColumn.name, TableColumn)
// 无限滚动列表
Vue.component('virtual-scroll-list', VirtualScrollList)

Vue.use(VueMoment, {
  moment
})

window.app = new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
window.app.debug = localStorage.getItem('debug') === '1'
